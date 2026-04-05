from django.urls import path
from .views import LoginView, LogoutView, UserProfileView, SessionLifecycleView

urlpatterns = [
    # Đăng nhập / Đăng xuất
    path('auth/login/', LoginView.as_view(), name='api-login'),
    path('auth/logout/', LogoutView.as_view(), name='api-logout'),
    
 
    path('profile/', UserProfileView.as_view(), name='api-user-profile'),
    
    # Tương tự với API sessions
    path('sessions/', SessionLifecycleView.as_view(), name='api-user-sessions'),
    path('sessions/<uuid:session_id_to_revoke>/', SessionLifecycleView.as_view(), name='api-revoke-session'),
]