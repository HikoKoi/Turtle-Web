import re
from rest_framework import serializers
from ..models import User, UserSession

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'full_name', 'username', 'email', 'phone_number', 'avatar', 'birthday']
        # Không trả về password trong API

    # 1. Validate định dạng Email (Django đã lo cơ bản, bạn có thể chặn thêm mail rác)
    def validate_email(self, value):
        if value and "@tempmail" in value:
            raise serializers.ValidationError("Vui lòng sử dụng email thật, không dùng email tạm thời.")
        return value

    # 2. Validate định dạng Số điện thoại (Bắt buộc dùng cú pháp validate_<tên_field>)
    def validate_phone_number(self, value):
        # Bỏ qua check nếu user không nhập (trong trường hợp DB cho phép null/blank)
        if not value: 
            return value
            
        phone_regex = re.compile(r"^(0[3|5|7|8|9])+([0-9]{8})$")
        if not phone_regex.match(value):
            raise serializers.ValidationError("Số điện thoại không hợp lệ. Vui lòng nhập 10 số và bắt đầu bằng 03, 05, 07, 08 hoặc 09.")
        return value

class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = ['session_id', 'ip_address', 'user_agent', 'is_revoked', 'created_at', 'expired_at']