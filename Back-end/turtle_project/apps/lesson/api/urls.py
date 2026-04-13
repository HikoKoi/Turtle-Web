from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LessonViewSet

# Router sẽ tự động tạo ra các đường dẫn: /lessons/, /lessons/{id}/
router = DefaultRouter()
router.register(r'', LessonViewSet, basename='lesson')

urlpatterns = [
    path('', include(router.urls)),
]