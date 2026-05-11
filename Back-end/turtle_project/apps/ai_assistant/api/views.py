from django.http import StreamingHttpResponse # THÊM DÒNG NÀY
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from ..models import AIChatMessage
from ..utils import get_ai_response, get_ai_response_stream, prune_messages # Đảm bảo đã có get_ai_response_stream
from .serializers import AIChatMessageSerializer

class ChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        user_message = request.data.get('message', '')
        current_code = request.data.get('code', '')
        error_log = request.data.get('error', '')
        # Lưu tin nhắn người dùng (nếu có lời nhắn thực sự)
        if user_message:
            AIChatMessage.objects.create(user=request.user, role='user', content=user_message)
        def stream_generator():
            full_response = ""
            for chunk in get_ai_response_stream(request.user, user_message, current_code, error_log):
                full_response += chunk
                yield chunk
            AIChatMessage.objects.create(user=request.user, role='assistant', content=full_response)
            prune_messages(request.user)
        return StreamingHttpResponse(stream_generator(), content_type='text/plain')

class ChatHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        messages = AIChatMessage.objects.filter(user=request.user).order_by('-created_at')[:10]
        serializer = AIChatMessageSerializer(reversed(messages), many=True)
        return Response(serializer.data)
