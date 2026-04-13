import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import UserSession

class LoginControlConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Lấy session_id từ URL đường dẫn ws://.../
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.user = self.scope["user"]

        if self.user.is_authenticated:
            await self.accept()
            # Khi kết nối thành công, đảm bảo ghế vẫn là is_revoked=False
            await self.update_session_status(self.session_id, False)
        else:
            await self.close()

    async def disconnect(self, close_code):
        # KHI TẮT TAB: Socket tự đứt -> Nhả ghế ngay lập tức!
        if hasattr(self, 'session_id'):
            await self.update_session_status(self.session_id, True)

    @database_sync_to_async
    def update_session_status(self, session_id, status):
        # Hàm này chạy logic DB để cập nhật trạng thái
        UserSession.objects.filter(session_id=session_id).update(is_revoked=status)