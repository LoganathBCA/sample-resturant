import json
from decimal import Decimal

from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST, require_http_methods
from django.db.models import Sum
from django.middleware.csrf import get_token
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes, throttle_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.throttling import AnonRateThrottle


from .models import MenuItem, Order, OrderItem
from .serializers import (
    RegisterSerializer,
    MenuItemSerializer,
    OrderCreateSerializer,
    OrderDetailSerializer,
)


# ═══════════════════════════════════════════════════════════
#  STOREFRONT VIEW — serves the customer-facing index.html
# ═══════════════════════════════════════════════════════════

def storefront_view(request):
    """Render the main customer-facing storefront."""
    # Ensure CSRF cookie is set for JS fetch calls
    csrf_token = get_token(request)
    return render(request, 'storefront/index.html', {'csrf_token': csrf_token})


# ═══════════════════════════════════════════════════════════
#  RATE LIMITING — Custom throttle for login endpoint
# ═══════════════════════════════════════════════════════════

class LoginRateThrottle(AnonRateThrottle):
    """Limit anonymous login attempts to 5 per minute."""
    scope = 'login'


# ═══════════════════════════════════════════════════════════
#  AUTHENTICATION API VIEWS
# ═══════════════════════════════════════════════════════════

@api_view(['POST'])
@authentication_classes([])  # Skip SessionAuthentication CSRF for public endpoint
@permission_classes([AllowAny])
def register_user(request):
    """POST /api/register/ — Create a new user account and return a token.

    On validation failure returns 400 with field-specific errors, e.g.:
    {"username": ["This username is already taken."],
     "password": ["This password is too short."]}
    """
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()
    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@authentication_classes([])  # Skip SessionAuthentication CSRF for public endpoint
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def login_user(request):
    """POST /api/login/ — Authenticate and return a token.
    Uses generic error messages to prevent user enumeration.
    Rate-limited to 5 attempts per minute."""
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    if not username or not password:
        return Response(
            {'error': 'Invalid email or password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {'error': 'Invalid email or password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
        }
    })


# ═══════════════════════════════════════════════════════════
#  API VIEWS
# ═══════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([AllowAny])
def menu_list(request):
    """GET /api/menu/ — Returns all available menu items."""
    items = MenuItem.objects.filter(is_available=True)
    serializer = MenuItemSerializer(items, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def order_create(request):
    """POST /api/orders/ — Create an order with items (auth required)."""
    serializer = OrderCreateSerializer(data=request.data)
    if serializer.is_valid():
        order = serializer.save(user=request.user)
        response_serializer = OrderDetailSerializer(order)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):
    """GET /api/my-orders/ — Returns only the authenticated user's orders."""
    orders = Order.objects.filter(
        user=request.user
    ).select_related('user').prefetch_related('items__menu_item').order_by('-created_at')
    serializer = OrderDetailSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def order_list_active(request):
    """GET /api/orders/active/ — Returns orders with Pending/Preparing status."""
    orders = Order.objects.filter(
        status__in=['Pending', 'Preparing', 'Ready']
    ).select_related('user').prefetch_related('items__menu_item')
    serializer = OrderDetailSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def order_update_status(request, pk):
    """PATCH /api/orders/<pk>/status/ — Update order status (staff only)."""
    order = get_object_or_404(Order, pk=pk)
    new_status = request.data.get('status')
    valid_statuses = ['Pending', 'Preparing', 'Ready', 'Out for Delivery', 'Cancelled']
    if new_status not in valid_statuses:
        return Response(
            {'error': f'Invalid status. Must be one of: {valid_statuses}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    order.status = new_status
    order.save()
    serializer = OrderDetailSerializer(order)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def order_cancel(request, pk):
    """PATCH /api/orders/<pk>/cancel/ — Cancel an order.

    Customers can cancel within 2 minutes of placing.
    Staff/managers can cancel at any time (e.g. out of stock).
    """
    order = get_object_or_404(Order, pk=pk)

    # Already cancelled or beyond Pending — reject for customers
    if order.status == 'Cancelled':
        return Response(
            {'error': 'This order has already been cancelled.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = request.user
    is_staff = user.is_staff or user.is_superuser or user.groups.filter(
        name__in=['Kitchen_Staff', 'Manager']
    ).exists()

    if is_staff:
        # Staff can cancel at any time
        order.status = 'Cancelled'
        order.save()
        serializer = OrderDetailSerializer(order)
        return Response(serializer.data)

    # Customer cancellation — must own the order
    if order.user != user:
        return Response(
            {'error': 'You can only cancel your own orders.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Must be Pending
    if order.status != 'Pending':
        return Response(
            {'error': 'Only pending orders can be cancelled.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check 2-minute grace period
    elapsed = (timezone.now() - order.created_at).total_seconds()
    if elapsed > 120:
        return Response(
            {'error': 'The 2-minute cancellation window has expired.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    order.status = 'Cancelled'
    order.save()
    serializer = OrderDetailSerializer(order)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def order_track(request, pk):
    """GET /api/orders/<pk>/track/ — Public order status lookup for customers."""
    order = get_object_or_404(Order, pk=pk)
    serializer = OrderDetailSerializer(order)
    return Response(serializer.data)


# ═══════════════════════════════════════════════════════════
#  DASHBOARD VIEW — Unified KDS + Admin Panel
# ═══════════════════════════════════════════════════════════

@login_required
def dashboard_view(request):
    """Render the unified dashboard (KDS for kitchen, full admin for managers)."""
    user = request.user
    is_kitchen = user.groups.filter(name='Kitchen_Staff').exists()
    is_manager = user.groups.filter(name='Manager').exists() or user.is_superuser

    # Active orders for KDS
    active_orders = Order.objects.filter(
        status__in=['Pending', 'Preparing', 'Ready']
    ).prefetch_related('items__menu_item').order_by('created_at')

    # Revenue stats for manager
    revenue_today = None
    revenue_total = None
    total_orders = None
    if is_manager:
        from django.utils import timezone
        today = timezone.now().date()
        revenue_today = Order.objects.filter(
            status='Out for Delivery',
            created_at__date=today
        ).aggregate(total=Sum('total_price'))['total'] or Decimal('0.00')

        revenue_total = Order.objects.filter(
            status='Out for Delivery'
        ).aggregate(total=Sum('total_price'))['total'] or Decimal('0.00')

        total_orders = Order.objects.count()

    context = {
        'is_kitchen': is_kitchen,
        'is_manager': is_manager,
        'active_orders': active_orders,
        'revenue_today': revenue_today,
        'revenue_total': revenue_total,
        'total_orders': total_orders,
    }
    return render(request, 'ordering/dashboard.html', context)
