from rest_framework import viewsets, permissions
from ..models import Lesson
from .serializers import LessonSerializer
from django.db import transaction

class LessonViewSet(viewsets.ModelViewSet):
    """
    ViewSet quản lý toàn bộ logic CRUD cho bài học (Lesson).
    """
    serializer_class = LessonSerializer
    
    # 1. Chặn những người chưa đăng nhập
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Lọc dữ liệu: Chỉ trả về bài học của chính người đang đăng nhập.
        Sử dụng select_related để tối ưu hóa việc truy vấn kèm bảng SourceCode.
        """
        user = self.request.user
        return Lesson.objects.filter(student=user).select_related('code_ref')

    def perform_create(self, serializer):
        """
        Khi tạo bài mới: Tự động lấy User từ Token và gán vào trường 'student'.
        """
        serializer.save(student=self.request.user)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)