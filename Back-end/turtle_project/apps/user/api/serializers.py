from rest_framework import serializers
from ..models import User, UserSession

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'full_name', 'username', 'email', 'phone_number', 'avatar', 'birthday']
        # Không trả về password trong API

class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = ['session_id', 'ip_address', 'user_agent', 'is_revoked', 'created_at', 'expired_at']