import uuid
from django.db import models

class User(models.Model):
    # Cột id sẽ được Django tự động tạo làm Primary Key
    full_name = models.CharField(max_length=255)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    password = models.CharField(max_length=128)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    birthday = models.DateField(blank=True, null=True)

    class Meta:
        db_table = 'user' # Chỉ định tên bảng hiển thị trong database

    def __str__(self):
        return self.username


class UserSession(models.Model):
    session_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Khóa ngoại liên kết với bảng User (Quan hệ 1 - N)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    
    refresh_token = models.CharField(max_length=255, unique=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.CharField(max_length=255, blank=True, null=True)
    is_revoked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expired_at = models.DateTimeField()

    class Meta:
        db_table = 'user_session'

    def __str__(self):
        return f"{self.user.username} - {self.session_id}"