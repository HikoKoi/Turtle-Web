# from rest_framework import serializers
# from ..models import User, UserSession

# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['id', 'full_name', 'username', 'email', 'phone_number', 'avatar', 'birthday']
#         # Không trả về password trong API

# class UserSessionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = UserSession
#         fields = ['session_id', 'ip_address', 'user_agent', 'is_revoked', 'created_at', 'expired_at']


from rest_framework import serializers
from django.core.validators import RegexValidator, EmailValidator
from django.contrib.auth.password_validation import validate_password
from phonenumber_field.serializerfields import PhoneNumberField
from ..models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    
    # Username: Bắt đầu bằng chữ, dài ít nhất 3 ký tự
    username = serializers.CharField(validators=[
        RegexValidator(
            regex=r'^[a-zA-Z][a-zA-Z0-9_]{2,14}$',
            message="Username bắt đầu bằng chữ, dài 3-15 ký tự (chỉ dùng chữ và số nhé)."
        )
    ])

    phone_number = PhoneNumberField(region='VN', required=False, allow_null=True)
    
    email = serializers.EmailField(validators=[EmailValidator()], required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'phone_number', 'birthday')

    def validate_username(self, value):
        if value and User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username này đã được sử dụng.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email này đã được sử dụng.")
        return value

    def validate_phone_number(self, value): 
        if value and User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("Số điện thoại này đã được đăng ký bởi một người dùng khác.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class UserProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    phone_number = PhoneNumberField(region='VN', required=False, allow_null=True)
    birthday = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'avatar', 'phone_number', 'birthday', 'date_joined', 'first_name', 'custom_commands')
        read_only_fields = ['id', 'date_joined'] 

    def validate_email(self, value):
        user = self.context['request'].user
        if value and User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Email này đã được sử dụng bởi một tài khoản khác.")
        return value

    def validate_phone_number(self, value):
        user = self.context['request'].user
        if value and User.objects.exclude(pk=user.pk).filter(phone_number=value).exists():
            raise serializers.ValidationError("Số điện thoại này đã được sử dụng bởi một tài khoản khác.")
        return value

    def get_phone_number_display(self, obj):
        if obj.phone_number:
            # Trả về định dạng 091... cho trẻ dễ nhìn
            return obj.phone_number.as_national 
        return None