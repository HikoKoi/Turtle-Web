import zlib

from django.db import models
from django.conf import settings

class SourceCode(models.Model):
    """
    Bảng lưu trữ nội dung mã nguồn đã được nén.
    Sử dụng hash_id (SHA-256) làm khóa chính để tránh trùng lặp nội dung.
    """
    hash_id = models.CharField(
        max_length=64, 
        primary_key=True, 
        editable=False,
        help_text="Mã băm SHA-256 của nội dung code gốc"
    )
    compressed_content = models.BinaryField(
        help_text="Dữ liệu code đã nén bằng zlib"
    )

    class Meta:
        db_table = 'source_code'

    def __str__(self):
        return f"Source: {self.hash_id[:10]}..."
    
    @property
    def plain_text(self):
        """Trả về nội dung code đã giải nén"""
        if not self.compressed_content:
            return ""
        return zlib.decompress(self.compressed_content).decode('utf-8')


class Lesson(models.Model):
    """
    Bảng quản lý thông tin bài học của người dùng.
    Mối quan hệ 1-n: Một người dùng có nhiều bài học.
    """
    # Trỏ đến User model trong app 'user' hoặc settings.AUTH_USER_MODEL
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lessons',
        db_column='student_id'
    )
    title = models.CharField(max_length=255)
    
    # Liên kết với bảng SourceCode
    # Dùng PROTECT để không xóa source code nếu vẫn còn bài học trỏ tới
    code_ref = models.ForeignKey(
        SourceCode,
        on_delete=models.PROTECT,
        related_name='associated_lessons',
        db_column='code_ref'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lesson'

    def __str__(self):
        return f"{self.title} (by {self.student.username})"