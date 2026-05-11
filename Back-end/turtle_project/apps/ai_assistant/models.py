from django.db import models
from django.conf import settings

class AIChatMessage(models.Model):
    # Liên kết với người dùng (nếu xóa người dùng thì xóa luôn tin nhắn)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='ai_messages'
    )
    
    # Vai trò: 'user' (bé) hoặc 'assistant' (Rùa AI)
    role = models.CharField(max_length=20)
    
    # Nội dung tin nhắn
    content = models.TextField()
    
    # Thời gian tạo
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']  # Sắp xếp tin nhắn theo thời gian

    def __str__(self):
        return f"{self.user.username} - {self.role}: {self.content[:20]}..."
