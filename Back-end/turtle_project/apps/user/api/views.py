from django.contrib.auth import authenticate
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
from ..models import User, UserSession
from .serializers import RegisterSerializer, UserProfileSerializer
from django.contrib.auth.models import update_last_login
import random
from django.core.cache import cache
from django.core.mail import send_mail

class UserViewSet(viewsets.GenericViewSet):
    def get_serializer_class(self):
        if self.action == 'register': return RegisterSerializer
        return UserProfileSerializer

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"msg": "Đăng ký thành công"}, status=201)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
    # --- Bước 1: Xác thực tài khoản ---
        # --- BƯỚC 0: Lấy dữ liệu đa phương thức từ FE ---
        username_in = request.data.get('username')
        email_in = request.data.get('email')
        phone_in = request.data.get('phone_number')
        password = request.data.get('password')

        # Xác định chuỗi định danh duy nhất (Identity)
        identity = username_in or email_in or phone_in

        if not identity or not password:
            return Response({"error": "Vui lòng nhập tài khoản và mật khẩu"}, status=400)

        # --- BƯỚC 1: Xác thực tài khoản ---
        # Django sẽ dùng MultiFieldModelBackend để quét username/email/phone
        user = authenticate(request, username=identity, password=password)

        if user is not None:
            if not user.is_active:
                return Response({
                    "error": "Tài khoản của Hiệp sĩ đã bị đóng băng do lâu ngày không hoạt động. Hãy nhờ cha mẹ liên hệ Admin để rã đông nhé! ❄️🐢"
                }, status=status.HTTP_403_FORBIDDEN)

        if user:
            update_last_login(None, user)  # Cập nhật last_login mỗi khi đăng nhập thành công
        else:
            return Response({"error": "Thông tin đăng nhập không chính xác"}, status=401)

        user_agent = request.META.get('HTTP_USER_AGENT', '')[:250]
        now = timezone.now()

        # --- BƯỚC 1: KIỂM TRA CHẶN TRUY CẬP (DÀNH CHO MÁY B) ---
        # Tìm xem có bất kỳ thiết bị nào KHÁC đang chiếm ghế không
        force = request.data.get('force', False)
        
        active_sessions_elsewhere = UserSession.objects.filter(
                user=user,
                is_revoked=False  # Đang giữ kết nối WebSocket
            ).exclude(user_agent=user_agent)

        if active_sessions_elsewhere.exists():
            if force == True or str(force).lower() == 'true':
                # Thu hồi các phiên đăng nhập ở thiết bị khác bằng cách update is_revoked thay vì xóa
                active_sessions_elsewhere.update(is_revoked=True)
            else:
                return Response({
                    "error": "Tài khoản hiện đang được đăng nhập ở 1 thiết bị khác, vui lòng thử lại sau.",
                    "is_conflict": True
                }, status=403)

        # --- Bước 3: Tìm kiếm session cũ của thiết bị này ---
        existing_session = UserSession.objects.filter(user=user, user_agent=user_agent).first()

        # --- Bước 4: Kiểm tra điều kiện "Hồi sinh" ---
        # CHỈ hồi sinh nếu session tồn tại VÀ chưa quá thời gian expired_at
        if existing_session and existing_session.expired_at > now:
            # HÀNH ĐỘNG: HỒI SINH
            # Reset lại thời gian 7 ngày mới, set is_revoked về False
            existing_session.refresh_expiry() 
            session = existing_session
            msg = "Session cũ đã được hồi sinh và gia hạn."
        else:
            # HÀNH ĐỘNG: TẠO MỚI (Trường hợp chưa có máy này hoặc máy này đã QUÁ HẠN)
            # Lưu ý: Chúng ta không xóa bản ghi cũ ở đây theo ý bạn, 
            # bản ghi cũ quá hạn sẽ nằm đó cho Celery xóa sau.
            jwt = RefreshToken.for_user(user)
            session = UserSession.objects.create(
                user=user,
                refresh_token=str(jwt),
                expired_at=now + timedelta(days=7),
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=user_agent
            )
            msg = "Tạo phiên làm việc mới thành công."

        # --- Bước 5: Trả về Token mới cho phiên này ---
        jwt = RefreshToken.for_user(user)
        return Response({
            "access": str(jwt.access_token),
            "refresh": str(jwt),
            "message": msg,
            "session_id": session.session_id,
            "user": UserProfileSerializer(user).data
        })

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def logout(self, request):
        # ĐĂNG XUẤT: Xóa vĩnh viễn khỏi DB
        # refresh_token = request.data.get('refresh')
        # UserSession.objects.filter(refresh_token=refresh_token).delete()
        session_id = request.data.get('session_id')
        UserSession.objects.filter(session_id=session_id).delete()
        return Response(status=204)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        user = request.user
        user_agent = request.META.get('HTTP_USER_AGENT', '')[:250]

        session = UserSession.objects.filter(
            user=user, 
            user_agent=user_agent,
            is_revoked=False,
            expired_at__gt=timezone.now()
        ).first()

        if not session:
            return Response(
                {"error": "Phiên làm việc đã bị vô hiệu hóa hoặc hết hạn"}, 
                status=401
            )
        
        # Nếu session ổn, cập nhật thời gian hết hạn
        session.refresh_expiry() 

        # QUAN TRỌNG: Trả về dữ liệu cho Frontend
        return Response(UserProfileSerializer(user, context={'request': request}).data, status=status.HTTP_200_OK)


    @action(detail=False, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_profile(self, request):
        user = request.user
        # partial=True cho phép cập nhật chỉ một vài trường mà không bắt buộc gửi hết
        serializer = UserProfileSerializer(user, data=request.data, partial=True, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Cập nhật thông tin hiệp sĩ thành công!",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not old_password or not new_password:
            return Response({"error": "Vui lòng nhập đầy đủ mật khẩu cũ và mới"}, status=400)

        if not user.check_password(old_password):
            return Response({"error": "Mật khẩu cũ không chính xác!"}, status=400)

        if new_password != confirm_password:
            return Response({"error": "Mật khẩu mới và xác nhận không khớp!"}, status=400)

        try:
            from django.contrib.auth.password_validation import validate_password
            validate_password(new_password, user)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Đổi mật khẩu thành công! 🔐"}, status=200)

        # Kiểm tra: Nếu không có session HOẶC session đó đã bị revoked
        if not session or session.is_revoked:
            return Response(
                {"error": "Phiên làm việc đã bị vô hiệu hóa (đăng nhập nơi khác) hoặc hết hạn"}, 
                status=401
            )
        
        # Nếu session vẫn còn sống (is_revoked=False) thì mới hồi sinh
        session.refresh_expiry() 
        return Response(UserProfileSerializer(user).data)


    @action(detail=False, methods=['post'], url_path='send-otp')
    def send_otp(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Vui lòng cung cấp Email"}, status=400)

        # 1. Tạo mã OTP 6 số
        otp = str(random.randint(100000, 999999))

        # 2. Lưu vào Redis trong 5 phút (300 giây)
        cache.set(f"otp_{email}", otp, timeout=300)

        # 3. Gửi Email
        subject = "Mã xác thực cho Hiệp sĩ Rùa 🐢"
        message = f"Mã OTP của con là: {otp}. Mã này sẽ hết hạn sau 5 phút nhé!"
        send_mail(subject, message, settings.EMAIL_HOST_USER, [email])

        return Response({"message": "Mã OTP đã được gửi đến Email của cha mẹ!"})

    @action(detail=False, methods=['post'], url_path='verify-otp')
    def verify_otp(self, request):
        email = request.data.get('email')
        otp_input = request.data.get('otp')

        # 1. Lấy mã từ Redis
        otp_stored = cache.get(f"otp_{email}")

        if not otp_stored:
            return Response({"error": "Mã OTP đã hết hạn hoặc không tồn tại"}, status=400)

        if otp_input != otp_stored:
            return Response({"error": "Mã OTP không chính xác, thử lại nhé!"}, status=400)

        # 2. Xác thực thành công
        user = request.user
        user.email = email
        user.is_email_verified = True
        user.save()

        # 3. Xóa OTP sau khi dùng xong
        cache.delete(f"otp_{email}")

        return Response({"message": "Xác thực Email thành công! Chúc mừng hiệp sĩ!"})