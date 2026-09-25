from rest_framework import serializers
from .models import ChatSession, MediaUpload, ChatMessage, Diagnosis, Booking

class MediaUploadSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = MediaUpload
        fields = ['id', 'file', 'file_url', 'file_type', 'mime_type', 'original_name', 'created_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class ChatMessageSerializer(serializers.ModelSerializer):
    media = MediaUploadSerializer(read_only=True)
    media_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'content', 'media', 'media_id', 'is_rejected', 'created_at']


class DiagnosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosis
        fields = [
            'id', 'session_id', 'issue_summary', 'severity', 'confidence',
            'symptoms_detected', 'possible_cause', 'recommended_action',
            'recommended_repair', 'estimated_cost', 'estimated_time', 'created_at'
        ]


class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    diagnosis = DiagnosisSerializer(read_only=True)

    class Meta:
        model = ChatSession
        fields = ['session_id', 'car_make', 'car_model', 'car_year', 'status', 'messages', 'diagnosis', 'created_at', 'updated_at']


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'booking_id', 'session', 'diagnosis', 'customer_name', 
            'customer_email', 'customer_phone', 'car_company', 'car_model',
            'vehicle_info', 'vehicle_problem', 'service_requested', 
            'preferred_date', 'preferred_time', 'notes', 'status', 'created_at'
        ]
        read_only_fields = ['booking_id', 'created_at']
