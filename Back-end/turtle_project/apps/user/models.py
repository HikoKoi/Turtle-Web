import uuid
from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from phonenumber_field.modelfields import PhoneNumberField
from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):
    phone_number = PhoneNumberField(region='VN', unique=True, null=True, blank=True)
    telegram_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    birthday = models.DateField(blank=True, null=True)
    custom_commands = models.JSONField(default=list, blank=True)
    
    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    
    selected_title = models.CharField(max_length=50, default="Hiệp sĩ tập sự")
    unlocked_titles = models.JSONField(default=list, blank=True)
   
    def unlock_title(self, title_name):
        if not self.unlocked_titles:
            self.unlocked_titles = ["Hiệp sĩ tập sự"]
        if title_name not in self.unlocked_titles:
            self.unlocked_titles.append(title_name)
            self.save()

    def save(self, *args, **kwargs):
        if not self.unlocked_titles:
            self.unlocked_titles = ["Hiệp sĩ tập sự"]
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'user'

class UserSession(models.Model):
    session_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions')
    refresh_token = models.CharField(max_length=512, unique=True, db_index=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    is_revoked = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expired_at = models.DateTimeField()

    class Meta:
        db_table = 'user_session'
        ordering = ['-created_at']

# Trong Model UserSession
    def refresh_expiry(self, new_token=None):
        self.expired_at = timezone.now() + timedelta(days=7)
        self.is_revoked = False
        if new_token:
            self.refresh_token = new_token
        self.save()

    @property
    def is_valid(self):
        return not self.is_revoked and self.expired_at > timezone.now()