import secrets
from datetime import timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.contrib.auth.hashers import check_password
from ..models import User, UserSession, OTPVerification
from .serializers import UserSerializer, UserSessionSerializer
import random
from django.core.mail import send_mail
# --- HÀM HỖ TRỢ XÁC THỰC ---
def get_user_from_session(request):
    """
    Hàm này lấy session_id từ header 'Authorization' để kiểm tra xem
    người dùng đã đăng nhập hay chưa và session còn hạn không.
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None, "Thiếu session_id trong header Authorization."
    
    try:
        session_id = auth_header.replace('Bearer ', '')
        session = UserSession.objects.get(session_id=session_id)
        
        if session.is_revoked:
            return None, "Phiên đăng nhập đã bị thu hồi."
        if session.expired_at < timezone.now():
            return None, "Phiên đăng nhập đã hết hạn."
            
        return session.user, None
    except UserSession.DoesNotExist:
        return None, "Session không hợp lệ."
    except ValueError:
        return None, "Định dạng session_id không đúng."

# --- 1. API ĐĂNG NHẬP (CHIẾN LƯỢC ĐỘC QUYỀN) ---
class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Vui lòng cung cấp username và password.'}, status=status.HTTP_400_BAD_REQUEST)

        # Bước 1: Tìm user dựa trên username
        user = User.objects.filter(username=username).first()
        
        # Bước 2: Dùng check_password để so sánh mật khẩu người dùng nhập với mật khẩu đã hash trong DB
        if not user or not check_password(password, user.password):
            return Response({'error': 'Sai tên đăng nhập hoặc mật khẩu.'}, status=status.HTTP_401_UNAUTHORIZED)

        # =====================================================================
        # BƯỚC 3: XỬ LÝ ĐỘC QUYỀN ĐĂNG NHẬP (ĐÁ SESSION CŨ)
        # Vô hiệu hóa tất cả các phiên đăng nhập đang hoạt động của user này
        # =====================================================================
        UserSession.objects.filter(user=user, is_revoked=False).update(is_revoked=True)

        # Bước 4: Tạo Refresh Token và lưu Session mới cho thiết bị hiện tại
        refresh_token = secrets.token_hex(32)
        expired_at = timezone.now() + timedelta(days=30) 
        
        ip_address = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT')[:250] if request.META.get('HTTP_USER_AGENT') else 'Unknown'

        session = UserSession.objects.create(
            user=user,
            refresh_token=refresh_token,
            ip_address=ip_address,
            user_agent=user_agent,
            expired_at=expired_at
        )

        return Response({
            'message': 'Đăng nhập thành công',
            'session_id': session.session_id,
            'refresh_token': session.refresh_token,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

# --- 2. API ĐĂNG XUẤT ---
class LogoutView(APIView):
    def post(self, request):
        # Yêu cầu client gửi session_id cần đăng xuất trong body hoặc header
        session_id = request.data.get('session_id') or request.headers.get('Authorization', '').replace('Bearer ', '')
        
        try:
            session = UserSession.objects.get(session_id=session_id)
            session.is_revoked = True  # Đánh dấu session đã bị hủy
            session.save()
            return Response({'message': 'Đăng xuất thành công.'}, status=status.HTTP_200_OK)
        except UserSession.DoesNotExist:
            return Response({'error': 'Không tìm thấy phiên đăng nhập.'}, status=status.HTTP_404_NOT_FOUND)

# --- 3. API QUẢN LÝ THÔNG TIN USER ---
class UserProfileView(APIView):
    def get(self, request):
        user, error = get_user_from_session(request)
        if error: return Response({'error': error}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        user, error = get_user_from_session(request)
        if error: return Response({'error': error}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = UserSerializer(user, data=request.data, partial=True) # partial=True cho phép update 1 vài trường
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Cập nhật thông tin thành công', 'data': serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- 4. API VÒNG ĐỜI & QUẢN LÝ SESSION ---
class SessionLifecycleView(APIView):
    # Lấy danh sách các thiết bị/phiên đang hoạt động
    def get(self, request):
        user, error = get_user_from_session(request)
        if error: return Response({'error': error}, status=status.HTTP_401_UNAUTHORIZED)

        # Lấy các session chưa hết hạn và chưa bị revoke
        active_sessions = UserSession.objects.filter(
            user=user, 
            is_revoked=False, 
            expired_at__gt=timezone.now()
        ).order_by('-created_at')

        serializer = UserSessionSerializer(active_sessions, many=True)
        return Response({'active_sessions': serializer.data}, status=status.HTTP_200_OK)

    # Đăng xuất khỏi thiết bị khác (Xóa session_id cụ thể)
    def delete(self, request, session_id_to_revoke):
        user, error = get_user_from_session(request)
        if error: return Response({'error': error}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            session_to_revoke = UserSession.objects.get(
                session_id=session_id_to_revoke, 
                user=user # Bảo mật: Chỉ được xóa session của chính mình
            )
            session_to_revoke.is_revoked = True
            session_to_revoke.save()
            return Response({'message': 'Đã đăng xuất khỏi thiết bị được chọn.'}, status=status.HTTP_200_OK)
        except UserSession.DoesNotExist:
            return Response({'error': 'Session không tồn tại hoặc không thuộc quyền sở hữu.'}, status=status.HTTP_404_NOT_FOUND)
        
class RequestOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        
        # 1. Tạo mã OTP 6 số
        otp_code = str(random.randint(100000, 999999))
        
        # 2. Lưu vào DB
        OTPVerification.objects.create(email=email, otp_code=otp_code)
        
        # 3. Gửi email
        subject = 'Mã xác thực OTP của bạn'
        message = f'Mã OTP của bạn là: {otp_code}. Mã này sẽ hết hạn trong 5 phút.'
        send_mail(
            subject, 
            message, 
            'email_he_thong_cua_ban@gmail.com', # Từ ai
            [email], # Gửi tới ai
            fail_silently=False,
        )
        return Response({'message': 'OTP đã được gửi tới email của bạn.'})
    
class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')
        
        # Tìm OTP mới nhất của email này
        otp_record = OTPVerification.objects.filter(email=email, otp_code=otp_code).order_by('-created_at').first()
        
        if otp_record and otp_record.is_valid():
            otp_record.is_used = True # Đánh dấu đã dùng để không bị xài lại
            otp_record.save()
            
            # --- TÙY VÀO MỤC ĐÍCH MÀ BẠN XỬ LÝ TIẾP ---
            # Nếu là đăng ký: Cho phép tạo tài khoản
            # Nếu là Quên mật khẩu: Trả về một token tạm thời để họ được phép gọi API /reset-password/
            
            return Response({'message': 'Xác thực thành công!', 'status': 'VERIFIED'})
            
        return Response({'error': 'Mã OTP không hợp lệ hoặc đã hết hạn.'}, status=400)