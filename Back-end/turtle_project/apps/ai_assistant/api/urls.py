from django.urls import path
from .views import ChatView, ChatHistoryView

urlpatterns = [
    path('chat/', ChatView.as_view(), name='ai-chat'),
    path('history/', ChatHistoryView.as_view(), name='ai-history'),
]
