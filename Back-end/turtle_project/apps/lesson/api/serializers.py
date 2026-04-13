# apps/lesson/api/serializers.py

import zlib
import hashlib
from rest_framework import serializers
from ..models import Lesson, SourceCode

class LessonSerializer(serializers.ModelSerializer):
    # 1. Trường write_only: Chỉ nhận vào khi POST/PUT, không hiện ra khi GET
    raw_code = serializers.CharField(write_only=True)
    
    # 2. Trường read_only: Trả code đã giải nén về cho FE qua property ở Model
    code_display = serializers.CharField(source='code_ref.plain_text', read_only=True)

    class Meta:
        model = Lesson
        # Bao gồm cả trường ảo và trường thật
        fields = ['id', 'title', 'raw_code', 'code_display', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Lấy code thuần ra khỏi dữ liệu đã validate
        raw_code = validated_data.pop('raw_code')
        
        # --- Logic xử lý Nén & Băm ---
        code_bytes = raw_code.encode('utf-8')
        c_hash = hashlib.sha256(code_bytes).hexdigest()
        compressed = zlib.compress(code_bytes, level=9)

        # Sử dụng get_or_create để không lưu trùng code giống hệt nhau
        source_obj, created = SourceCode.objects.get_or_create(
            hash_id=c_hash,
            defaults={'compressed_content': compressed}
        )

        # Tạo Lesson và gắn với SourceCode + User (giả sử đã gán student ở view)
        lesson = Lesson.objects.create(
            code_ref=source_obj,
            **validated_data
        )
        return lesson
    
    def update(self, instance, validated_data):
        # 1. Kiểm tra xem có gửi code mới lên không
        raw_code = validated_data.pop('raw_code', None)

        if raw_code is not None:
            # 2. Thực hiện lại logic Băm & Nén y hệt lúc tạo
            code_bytes = raw_code.encode('utf-8')
            c_hash = hashlib.sha256(code_bytes).hexdigest()
            compressed = zlib.compress(code_bytes, level=9)

            # 3. Lấy hoặc tạo SourceCode mới
            source_obj, created = SourceCode.objects.get_or_create(
                hash_id=c_hash,
                defaults={'compressed_content': compressed}
            )
            # 4. Đổi "mối dây liên kết" của bài học sang bản code mới
            instance.code_ref = source_obj

        # 5. Cập nhật các trường khác (như tiêu đề)
        instance.title = validated_data.get('title', instance.title)
        instance.save()
        return instance