from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Lesson, UserStageProgress
from .serializers import LessonSerializer
from django.db import transaction
from django.core.cache import cache
from ai_assistant.grader import grade_student_code

class LessonViewSet(viewsets.ModelViewSet):
    """
    ViewSet quản lý toàn bộ logic CRUD cho bài học (Lesson) cùng các action bổ trợ.
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

    @action(detail=False, methods=['post'], url_path='grade')
    def grade(self, request):
        """
        API nộp bài tập chặng và gọi AI chấm điểm có tích hợp Rate Limiting.
        """
        user = request.user
        stage_number = request.data.get('stage_number')
        code = request.data.get('code')

        if not stage_number or not code:
            return Response(
                {"detail": "Vui lòng cung cấp đầy đủ thông tin chặng học và mã nguồn!"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            stage_number = int(stage_number)
        except ValueError:
            return Response(
                {"detail": "Số thứ tự chặng học phải là số nguyên!"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. KIỂM SOÁT TẦN SUẤT (Rate Limiting) - Khóa 10 giây bằng Redis Cache
        cache_key = f"rate_limit_grade_{user.id}"
        is_locked = cache.get(cache_key)
        if is_locked:
            return Response(
                {"detail": "Từ từ đã con ơi! Sư phụ Rùa đang chấm bài trước đó rồi. Đợi khoảng 10 giây rồi gửi lại nhé! 🐢⏳"},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # Đặt khóa trong 10 giây
        cache.set(cache_key, True, timeout=10)

        # 2. KIỂM TRA MỞ KHÓA TUYẾN TÍNH (Linear Progression)
        if stage_number > 1:
            prev_stage_completed = UserStageProgress.objects.filter(
                user=user, 
                stage_number=stage_number - 1, 
                is_completed=True
            ).exists()
            if not prev_stage_completed:
                return Response(
                    {"detail": f"Ối! Con phải hoàn thành Chặng {stage_number - 1} trước thì mới được làm Chặng {stage_number} nhé! 🔒"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # 3. GỌI AI CHẤM ĐIỂM
        result = grade_student_code(stage_number, code)

        # 4. GHI NHẬN TIẾN TRÌNH & MỞ KHÓA DANH HIỆU
        if result.get("is_correct") is True:
            # Lưu hoặc cập nhật trạng thái hoàn thành chặng
            progress, created = UserStageProgress.objects.update_or_create(
                user=user,
                stage_number=stage_number,
                defaults={
                    "is_completed": True,
                    "submitted_code": code
                }
            )

            # Mở khóa danh hiệu RPG cho trẻ em theo mốc chặng học
            unlocked_title = None
            if stage_number == 2:
                unlocked_title = "Họa Sĩ Sắc Màu 🎨"
            elif stage_number == 4:
                unlocked_title = "Chúa Tể Vòng Lặp 🔄"
            elif stage_number == 7:
                unlocked_title = "Phù Thủy Tọa Độ 🌀"
            elif stage_number == 10:
                unlocked_title = "Chiến Binh Rùa Thần 🏆"

            if unlocked_title:
                user.unlock_title(unlocked_title)
                result["new_title_unlocked"] = unlocked_title

        return Response(result, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='progress')
    def progress(self, request):
        """
        API lấy danh sách tiến trình các chặng đã hoàn thành của người dùng cùng với mã nguồn đã nộp.
        """
        user = request.user
        progress_qs = UserStageProgress.objects.filter(user=user, is_completed=True)
        completed_stages = [p.stage_number for p in progress_qs]
        stage_codes = {p.stage_number: p.submitted_code for p in progress_qs}
        
        return Response({
            "completed_stages": completed_stages,
            "stage_codes": stage_codes,
            "unlocked_titles": user.unlocked_titles or ["Hiệp Sĩ Tập Sự ⚔️"],
            "selected_title": user.selected_title or "Hiệp Sĩ Tập Sự ⚔️"
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='update-title')
    def update_title(self, request):
        """
        API đổi danh hiệu đang hiển thị cho người dùng từ kho danh hiệu đã mở khóa.
        """
        user = request.user
        title = request.data.get('title')

        if not title:
            return Response(
                {"detail": "Vui lòng chọn danh hiệu con muốn đổi!"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Đảm bảo danh hiệu này đã được mở khóa
        unlocked_list = user.unlocked_titles or ["Hiệp Sĩ Tập Sự ⚔️"]
        if title not in unlocked_list:
            return Response(
                {"detail": f"Danh hiệu '{title}' chưa được mở khóa đâu con nhé! Hãy tiếp tục học vẽ thôi nào! 🔒"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.selected_title = title
        user.save()

        return Response({
            "detail": "Đổi danh hiệu thành công rồi con nhé! Oai phong quá! ✨🦁",
            "selected_title": user.selected_title
        }, status=status.HTTP_200_OK)