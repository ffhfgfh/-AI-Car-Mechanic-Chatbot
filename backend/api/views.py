import uuid
import logging
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.response import Response

from .models import ChatSession, MediaUpload, ChatMessage, Diagnosis, Booking
from .serializers import (
    ChatSessionSerializer, ChatMessageSerializer, MediaUploadSerializer, 
    DiagnosisSerializer, BookingSerializer
)
from .ai_service import generate_mechanic_response

logger = logging.getLogger(__name__)


@api_view(['GET'])
def api_root_view(request):
    """
    GET /api/ or GET /
    API root status overview.
    """
    return Response({
        'status': 'online',
        'message': 'AI Car Mechanic Assistant API is running smoothly',
        'version': '1.0.0',
        'endpoints': {
            'chat': '/api/chat/',
            'upload': '/api/upload/',
            'diagnosis': '/api/diagnosis/',
            'booking': '/api/booking/',
            'sessions': '/api/sessions/',
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST', 'GET'])
def session_list_create(request):
    """
    POST: Create a new chat session or get existing by session_id.
    GET: List all recent active chat sessions.
    """
    if request.method == 'GET':
        sessions = ChatSession.objects.all().order_by('-created_at')[:20]
        serializer = ChatSessionSerializer(sessions, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    session_id = request.data.get('session_id')
    car_make = request.data.get('car_make', '')
    car_model = request.data.get('car_model', '')
    car_year = request.data.get('car_year', '')

    if session_id:
        session, created = ChatSession.objects.get_or_create(session_id=session_id)
        if car_make: session.car_make = car_make
        if car_model: session.car_model = car_model
        if car_year: session.car_year = car_year
        session.save()
    else:
        session = ChatSession.objects.create(
            car_make=car_make,
            car_model=car_model,
            car_year=car_year
        )

    serializer = ChatSessionSerializer(session, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED if 'created' in locals() and created else status.HTTP_200_OK)


@api_view(['POST'])
def chat_view(request):
    """
    POST /api/chat/
    Send message to mechanic chatbot.
    Receives: { session_id, message, media_id?, car_make?, car_model?, car_year? }
    Applies rule-based off-topic rejection first before calling AI API.
    """
    session_id = request.data.get('session_id')
    user_message_text = request.data.get('message', '').strip()
    media_id = request.data.get('media_id')
    car_make = request.data.get('car_make')
    car_model = request.data.get('car_model')
    car_year = request.data.get('car_year')

    if not user_message_text and not media_id:
        return Response(
            {"error": "Either 'message' or 'media_id' must be provided."}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Fetch or create session
    if session_id:
        session, _ = ChatSession.objects.get_or_create(session_id=session_id)
    else:
        session = ChatSession.objects.create()

    # Update vehicle info if provided
    if car_make: session.car_make = car_make
    if car_model: session.car_model = car_model
    if car_year: session.car_year = car_year
    session.save()

    # Fetch optional media upload
    media_obj = None
    if media_id:
        try:
            media_obj = MediaUpload.objects.get(id=media_id)
        except MediaUpload.DoesNotExist:
            pass

    # Save User message
    user_msg_obj = ChatMessage.objects.create(
        session=session,
        sender='user',
        content=user_message_text or (f"[Uploaded {media_obj.file_type.capitalize()}]" if media_obj else ""),
        media=media_obj
    )

    # Process with AI Mechanic Engine (rule-based filter + Gemini API)
    result = generate_mechanic_response(session, user_message_text or "Please inspect this attached media.", media_obj)

    reply_text = result['reply']
    is_rejected = result['is_rejected']
    diag_dict = result['diagnosis_data']

    # Save Bot reply
    bot_msg_obj = ChatMessage.objects.create(
        session=session,
        sender='bot',
        content=reply_text,
        is_rejected=is_rejected
    )

    # Handle automatic diagnosis creation if diagnostic criteria met
    diag_serializer = None
    if diag_dict:
        diagnosis, _ = Diagnosis.objects.update_or_create(
            session=session,
            defaults={
                'issue_summary': diag_dict['issue_summary'],
                'severity': diag_dict['severity'],
                'confidence': diag_dict.get('confidence', '85%'),
                'symptoms_detected': diag_dict.get('symptoms_detected', '✓ Abnormal noise\n✓ Performance degradation'),
                'possible_cause': diag_dict.get('possible_cause', 'Mechanical component wear or fluid leak'),
                'recommended_action': diag_dict.get('recommended_action', 'Inspect vehicle drivetrain and component wear'),
                'recommended_repair': diag_dict['recommended_repair'],
                'estimated_cost': diag_dict['estimated_cost'],
                'estimated_time': diag_dict['estimated_time']
            }
        )
        session.status = 'diagnosed'
        session.save()
        diag_serializer = DiagnosisSerializer(diagnosis).data

    # Return structured chat response
    return Response({
        'session_id': session.session_id,
        'reply': reply_text,
        'is_rejected': is_rejected,
        'user_message': ChatMessageSerializer(user_msg_obj, context={'request': request}).data,
        'bot_message': ChatMessageSerializer(bot_msg_obj, context={'request': request}).data,
        'diagnosis': diag_serializer or (DiagnosisSerializer(session.diagnosis).data if hasattr(session, 'diagnosis') else None),
        'session_status': session.status
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_view(request):
    """
    POST /api/upload/
    Uploads media files (Image, Audio, Video).
    Returns file metadata and media URL.
    """
    uploaded_file = request.FILES.get('file')
    if not uploaded_file:
        return Response({'error': 'No file provided in request.'}, status=status.HTTP_400_BAD_REQUEST)

    content_type = uploaded_file.content_type or ''
    if content_type.startswith('image/'):
        file_type = 'image'
    elif content_type.startswith('audio/'):
        file_type = 'audio'
    elif content_type.startswith('video/'):
        file_type = 'video'
    else:
        file_type = 'file'

    media_obj = MediaUpload.objects.create(
        file=uploaded_file,
        file_type=file_type,
        mime_type=content_type,
        original_name=uploaded_file.name
    )

    serializer = MediaUploadSerializer(media_obj, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def diagnosis_view(request):
    """
    POST /api/diagnosis/
    Generates or retrieves diagnosis summary for a chat session.
    Receives: { session_id, issue_summary?, severity?, recommended_repair? }
    """
    session_id = request.data.get('session_id')
    if not session_id:
        return Response({'error': "Parameter 'session_id' is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        session = ChatSession.objects.get(session_id=session_id)
    except ChatSession.DoesNotExist:
        return Response({'error': f"Session '{session_id}' not found."}, status=status.HTTP_404_NOT_FOUND)

    # Check if explicit diagnosis parameters were sent or generate from current session messages
    if hasattr(session, 'diagnosis'):
        diag = session.diagnosis
    else:
        # Create standard diagnosis based on request data or fallback
        issue_summary = request.data.get('issue_summary', 'Multi-Point Mechanical Troubleshooting & Inspection')
        severity = request.data.get('severity', 'medium')
        recommended_repair = request.data.get('recommended_repair', 'Comprehensive brake system & drivetrain diagnostic')
        estimated_cost = request.data.get('estimated_cost', '$150 - $350')
        estimated_time = request.data.get('estimated_time', '1 - 2 hours')

        diag = Diagnosis.objects.create(
            session=session,
            issue_summary=issue_summary,
            severity=severity,
            recommended_repair=recommended_repair,
            estimated_cost=estimated_cost,
            estimated_time=estimated_time
        )
        session.status = 'diagnosed'
        session.save()

    serializer = DiagnosisSerializer(diag)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def booking_create_view(request):
    """
    POST /api/booking/
    Creates a new mechanic booking for a session/diagnosis.
    Captures: customer details, car company, car model, selected date & time, vehicle problem.
    """
    session_id = request.data.get('session_id')
    diagnosis_id = request.data.get('diagnosis_id')
    customer_name = request.data.get('customer_name')
    customer_email = request.data.get('customer_email')
    customer_phone = request.data.get('customer_phone')
    car_company_req = request.data.get('car_company', '')
    car_model_req = request.data.get('car_model', '')
    vehicle_info_req = request.data.get('vehicle_info', '')
    vehicle_problem_req = request.data.get('vehicle_problem', '')
    service_requested = request.data.get('service_requested', 'General Mechanical Repair / Diagnostic')
    preferred_date = request.data.get('preferred_date')
    preferred_time = request.data.get('preferred_time', '10:00 AM')
    notes = request.data.get('notes', '')

    if not customer_name or not customer_email or not customer_phone or not preferred_date:
        return Response({
            'error': 'Missing required fields: customer_name, customer_email, customer_phone, preferred_date'
        }, status=status.HTTP_400_BAD_REQUEST)

    session = None
    if session_id:
        session = ChatSession.objects.filter(session_id=session_id).first()

    diagnosis = None
    if diagnosis_id:
        diagnosis = Diagnosis.objects.filter(id=diagnosis_id).first()
    elif session and hasattr(session, 'diagnosis'):
        diagnosis = session.diagnosis

    # Determine Car Company, Car Model, and Vehicle Problem
    car_company = car_company_req or (session.car_make if session and session.car_make else 'Automotive Vehicle')
    car_model = car_model_req or (session.car_model if session and session.car_model else 'Standard Model')
    vehicle_problem = vehicle_problem_req or (diagnosis.issue_summary if diagnosis else service_requested)

    vehicle_info = vehicle_info_req or f"{session.car_year if session and session.car_year else ''} {car_company} {car_model}".strip()

    booking = Booking.objects.create(
        session=session,
        diagnosis=diagnosis,
        customer_name=customer_name,
        customer_email=customer_email,
        customer_phone=customer_phone,
        car_company=car_company,
        car_model=car_model,
        vehicle_info=vehicle_info,
        vehicle_problem=vehicle_problem,
        service_requested=service_requested,
        preferred_date=preferred_date,
        preferred_time=preferred_time,
        notes=notes,
        status='confirmed'
    )

    if session:
        session.status = 'booked'
        session.save()

    serializer = BookingSerializer(booking)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def booking_detail_view(request, booking_id):
    """
    GET /api/booking/{id}/
    Retrieves mechanic booking details by ID (accepts string booking_id or numeric PK).
    """
    booking = None
    if booking_id.isdigit():
        booking = Booking.objects.filter(pk=int(booking_id)).first()
    
    if not booking:
        booking = Booking.objects.filter(booking_id=booking_id).first()

    if not booking:
        return Response({'error': f"Booking with ID '{booking_id}' not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = BookingSerializer(booking)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def session_detail_view(request, session_id):
    """
    GET /api/chat/{session_id}/
    Retrieves full conversation history and diagnosis status for a session.
    """
    try:
        session = ChatSession.objects.get(session_id=session_id)
    except ChatSession.DoesNotExist:
        return Response({'error': f"Session '{session_id}' not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = ChatSessionSerializer(session, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)
