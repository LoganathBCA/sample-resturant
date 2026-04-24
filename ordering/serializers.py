from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import MenuItem, Order, OrderItem


class RegisterSerializer(serializers.Serializer):
    """
    Validates registration data and returns user-friendly, field-specific errors.
    Expected payload: {username, email, password, confirm_password}
    """
    username = serializers.CharField(
        max_length=150,
        error_messages={
            'required': 'Please enter a username.',
            'blank': 'Please enter a username.',
            'max_length': 'Username is too long — please use 150 characters or fewer.',
        }
    )
    email = serializers.EmailField(
        required=False, allow_blank=True, default='',
        error_messages={
            'invalid': 'That doesn\'t look like a valid email address.',
        }
    )
    password = serializers.CharField(
        write_only=True, min_length=8,
        error_messages={
            'required': 'Please enter a password.',
            'blank': 'Please enter a password.',
            'min_length': 'Password must be at least 8 characters long.',
        }
    )
    confirm_password = serializers.CharField(
        write_only=True,
        error_messages={
            'required': 'Please confirm your password.',
            'blank': 'Please confirm your password.',
        }
    )

    def validate_username(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Please enter a username.')
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                'This username is already taken. Please choose another one.'
            )
        return value

    def validate_email(self, value):
        value = value.strip()
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                'An account with this email already exists. Try logging in instead.'
            )
        return value

    def validate_password(self, value):
        """Run Django's AUTH_PASSWORD_VALIDATORS and rewrite messages to be user-friendly."""
        # Map Django's technical messages → friendly messages
        FRIENDLY_PASSWORD_MESSAGES = {
            'This password is too short.': 'Password must be at least 8 characters long.',
            'This password is too common.': 'This password is too easy to guess. Please choose a stronger one.',
            'This password is entirely numeric.': 'Password can\'t be all numbers — please include some letters.',
            'The password is too similar to the username.': 'Your password is too similar to your username. Please choose something different.',
            'The password is too similar to the email address.': 'Your password is too similar to your email. Please choose something different.',
        }
        try:
            password_validation.validate_password(value)
        except DjangoValidationError as e:
            friendly = []
            for msg in e.messages:
                # Try to match the start of the message for partial matches
                matched = False
                for technical, user_friendly in FRIENDLY_PASSWORD_MESSAGES.items():
                    if msg.startswith(technical.rstrip('.')) or msg == technical:
                        friendly.append(user_friendly)
                        matched = True
                        break
                if not matched:
                    friendly.append(msg)
            raise serializers.ValidationError(friendly)
        return value

    def validate(self, attrs):
        """Cross-field validation: confirm_password must match password."""
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({
                'confirm_password': ['Passwords do not match.']
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        return user


class MenuItemSerializer(serializers.ModelSerializer):
    """Read-only serializer for available menu items."""
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'description', 'price', 'image_url', 'category', 'is_available']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class OrderItemCreateSerializer(serializers.Serializer):
    """Accepts menu_item id + quantity for creating order items."""
    menu_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    """
    Accepts customer details and a list of items.
    Computes subtotals and total_price server-side.
    """
    customer_name = serializers.CharField(max_length=100)
    customer_phone = serializers.CharField(max_length=15)
    items = OrderItemCreateSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must contain at least one item.")
        # Verify all menu items exist and are available
        for item_data in value:
            try:
                mi = MenuItem.objects.get(pk=item_data['menu_item_id'])
                if not mi.is_available:
                    raise serializers.ValidationError(
                        f"'{mi.name}' is currently unavailable."
                    )
            except MenuItem.DoesNotExist:
                raise serializers.ValidationError(
                    f"Menu item with id {item_data['menu_item_id']} does not exist."
                )
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = validated_data.pop('user', None)
        total = 0
        order = Order.objects.create(
            customer_name=validated_data['customer_name'],
            customer_phone=validated_data['customer_phone'],
            user=user,
            total_price=0,
        )
        for item_data in items_data:
            mi = MenuItem.objects.get(pk=item_data['menu_item_id'])
            qty = item_data['quantity']
            subtotal = mi.price * qty
            total += subtotal
            OrderItem.objects.create(
                order=order,
                menu_item=mi,
                quantity=qty,
                subtotal=subtotal,
            )
        order.total_price = total
        order.save()
        return order


class OrderItemDetailSerializer(serializers.ModelSerializer):
    """Read-only serializer for order items in responses."""
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_name', 'quantity', 'subtotal']


class OrderDetailSerializer(serializers.ModelSerializer):
    """Read-only serializer for order responses."""
    items = OrderItemDetailSerializer(many=True, read_only=True)
    created_at = serializers.DateTimeField(format='iso-8601', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'customer_name', 'customer_phone', 'total_price',
                  'status', 'created_at', 'items']
