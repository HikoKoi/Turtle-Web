# apps/user/backends.py
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q
from phonenumber_field.phonenumber import PhoneNumber

User = get_user_model()

class MultiFieldModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            return None

        # Thử chuẩn hóa nếu là số điện thoại VN (biến 09... thành +849...)
        phone_ident = username
        try:
            if username.startswith('0'):
                phone_ident = PhoneNumber.from_string(username, region='VN').as_e164
        except Exception:
            pass

        try:
            # Tìm kiếm trên cả 3 trường
            user = User.objects.get(
                Q(username__iexact=username) | 
                Q(email__iexact=username) | 
                Q(phone_number=phone_ident)
            )
        except User.DoesNotExist:
            return None

        # Kiểm tra mật khẩu và trạng thái active
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None