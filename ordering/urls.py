from django.urls import path
from . import views

# /api/ endpoints
urlpatterns = [
    # Auth
    path('register/', views.register_user, name='api-register'),
    path('login/', views.login_user, name='api-login'),
    # Menu
    path('menu/', views.menu_list, name='api-menu-list'),
    # Orders
    path('orders/', views.order_create, name='api-order-create'),
    path('orders/active/', views.order_list_active, name='api-orders-active'),
    path('orders/<int:pk>/status/', views.order_update_status, name='api-order-status'),
    path('orders/<int:pk>/cancel/', views.order_cancel, name='api-order-cancel'),
    path('orders/<int:pk>/track/', views.order_track, name='api-order-track'),
    # My Orders (auth required)
    path('my-orders/', views.my_orders, name='api-my-orders'),
]
