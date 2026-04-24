from django import template

register = template.Library()


@register.filter(name='has_group')
def has_group(user, group_name):
    """
    Usage: {% if request.user|has_group:"Kitchen_Staff" %}
    Returns True if the user belongs to the given group.
    """
    return user.groups.filter(name=group_name).exists()
