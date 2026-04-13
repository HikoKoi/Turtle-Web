from rest_framework import serializers
from django.core.validators import RegexValidator, EmailValidator
from django.contrib.auth.password_validation import validate_password
from phonenumber_field.serializerfields import PhoneNumberField
from ..models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    
    # Username: Bắt đầu bằng chữ, bắt đầu có ít nhất 1 số hoặc ký tự đặc biệt
    username = serializers.CharField(validators=[
        RegexValidator(
            regex=r'^[a-zA-Z](?=.*[0-9!@#$%^&*])',
            message="Username bắt đầu bằng chữ, chứa ít nhất 1 số hoặc ký tự đặc biệt."
        )
    ])

    phone_number = PhoneNumberField(region='VN', required=False, allow_null=True)
    
    email = serializers.EmailField(validators=[EmailValidator()], required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'phone_number', 'birthday')

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
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'avatar', 'phone_number', 'birthday')
        read_only_fields = ['id', 'username'] # Không cho sửa ID và Username

    def get_phone_number_display(self, obj):
        if obj.phone_number:
            # Trả về định dạng 091... cho trẻ dễ nhìn
            return obj.phone_number.as_national 
        return None