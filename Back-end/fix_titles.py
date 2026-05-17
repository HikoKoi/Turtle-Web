import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from user.models import User

for u in User.objects.all():
    changed = False
    if not u.unlocked_titles:
        u.unlocked_titles = ["Hiệp Sĩ Tập Sự ⚔️"]
        changed = True
    elif "Hiệp sĩ tập sự" in u.unlocked_titles:
        u.unlocked_titles = ["Hiệp Sĩ Tập Sự ⚔️"] + [t for t in u.unlocked_titles if t != "Hiệp sĩ tập sự"]
        changed = True
    if u.selected_title == "Hiệp sĩ tập sự":
        u.selected_title = "Hiệp Sĩ Tập Sự ⚔️"
        changed = True
    if changed:
        u.save()
        print(f"Fixed {u.username}")
