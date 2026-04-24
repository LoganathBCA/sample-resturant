"""
Management command to set up RBAC groups and demo staff users.

Usage:
    python manage.py setup_groups

Creates:
  - Kitchen_Staff group (can view/change orders)
  - Manager group (all ordering permissions)
  - Demo users: kitchen1 / kitchen123, manager1 / manager123
  - Superuser: admin / admin123 (if not exists)
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from ordering.models import Order, OrderItem, MenuItem


class Command(BaseCommand):
    help = 'Create RBAC groups (Kitchen_Staff, Manager) and demo users'

    def handle(self, *args, **options):
        # ── Get content types ──
        order_ct = ContentType.objects.get_for_model(Order)
        orderitem_ct = ContentType.objects.get_for_model(OrderItem)
        menuitem_ct = ContentType.objects.get_for_model(MenuItem)

        # ── Kitchen_Staff group ──
        kitchen_group, created = Group.objects.get_or_create(name='Kitchen_Staff')
        kitchen_perms = Permission.objects.filter(
            content_type=order_ct,
            codename__in=['view_order', 'change_order']
        )
        kitchen_group.permissions.set(kitchen_perms)
        status_text = 'Created' if created else 'Already exists'
        self.stdout.write(f"  ✓ Kitchen_Staff group: {status_text}")

        # ── Manager group ──
        manager_group, created = Group.objects.get_or_create(name='Manager')
        manager_perms = Permission.objects.filter(
            content_type__in=[order_ct, orderitem_ct, menuitem_ct]
        )
        manager_group.permissions.set(manager_perms)
        status_text = 'Created' if created else 'Already exists'
        self.stdout.write(f"  ✓ Manager group: {status_text}")

        # ── Demo users ──
        # Kitchen staff user
        if not User.objects.filter(username='kitchen1').exists():
            kitchen_user = User.objects.create_user(
                username='kitchen1',
                password='kitchen123',
                first_name='Kitchen',
                last_name='Staff',
                is_staff=True,
            )
            kitchen_user.groups.add(kitchen_group)
            self.stdout.write("  ✓ Created user: kitchen1 / kitchen123")
        else:
            self.stdout.write("  • User kitchen1 already exists")

        # Manager user
        if not User.objects.filter(username='manager1').exists():
            manager_user = User.objects.create_user(
                username='manager1',
                password='manager123',
                first_name='Manager',
                last_name='Admin',
                is_staff=True,
            )
            manager_user.groups.add(manager_group)
            self.stdout.write("  ✓ Created user: manager1 / manager123")
        else:
            self.stdout.write("  • User manager1 already exists")

        # Superuser
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                password='admin123',
                email='admin@spicesizzle.com',
            )
            self.stdout.write("  ✓ Created superuser: admin / admin123")
        else:
            self.stdout.write("  • Superuser admin already exists")

        self.stdout.write(self.style.SUCCESS('\n✅ RBAC setup complete!'))
