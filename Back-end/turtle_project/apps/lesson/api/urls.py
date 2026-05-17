from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LessonViewSet

# Router sẽ tự động tạo ra các đường dẫn: /lessons/, /lessons/{id}/, cùng các action như /lessons/grade/, /lessons/progress/, /lessons/update-title/
router = DefaultRouter()
router.register(r'', LessonViewSet, basename='lesson')

urlpatterns = [
    path('', include(router.urls)),
]