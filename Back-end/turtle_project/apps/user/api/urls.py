# from django.urls import path
# from .views import LoginView, LogoutView, UserProfileView, SessionLifecycleView

# urlpatterns = [
#     # Đăng nhập / Đăng xuất
#     path('auth/login/', LoginView.as_view(), name='api-login'),
#     path('auth/logout/', LogoutView.as_view(), name='api-logout'),
    
 
#     path('profile/', UserProfileView.as_view(), name='api-user-profile'),
    
#     # Tương tự với API sessions
#     path('sessions/', SessionLifecycleView.as_view(), name='api-user-sessions'),
#     path('sessions/<uuid:session_id_to_revoke>/', SessionLifecycleView.as_view(), name='api-revoke-session'),
# ]


from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    # Endpoint để lấy token lần đầu (Login)
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # ĐÂY LÀ ENDPOINT BẠN ĐANG THIẾU
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]