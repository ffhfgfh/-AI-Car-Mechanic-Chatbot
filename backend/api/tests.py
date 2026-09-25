import os
from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient

from .models import ChatSession, MediaUpload, ChatMessage, Diagnosis, Booking

class CarMechanicApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.session = ChatSession.objects.create(
            car_make="Toyota",
            car_model="Camry",
            car_year="2020"
        )

    def test_off_topic_query_rejection(self):
        """Verify that non-car queries (e.g. programming, cooking, weather, movies, general QA) are politely rejected locally."""
        url = reverse('chat')
        off_topic_queries = [
            'Write me a Python script to sort an array using quicksort',
            'How do I bake a chocolate cake at home?',
            'What is the weather forecast for tomorrow?',
            'Who was the 16th president of the United States?',
            'Tell me a joke about a cat',
            'Which movie won Best Picture at the Oscars?'
        ]

        for query in off_topic_queries:
            data = {
                'session_id': self.session.session_id,
                'message': query
            }
            response = self.client.post(url, data, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertTrue(response.data['is_rejected'], f"Query '{query}' was not marked as rejected!")
            self.assertIn("Senior Automobile Technician", response.data['reply'])

    def test_car_query_troubleshooting(self):
        """Verify car-related query troubleshooting."""
        url = reverse('chat')
        data = {
            'session_id': self.session.session_id,
            'message': 'My brake pedal feels spongy and squeals when I press it down.'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_rejected'])
        self.assertIsNotNone(response.data['reply'])

    def test_common_typos_and_symptom_phrases(self):
        """Verify queries with common typos like 'my break is not working' are correctly identified as automotive queries."""
        url = reverse('chat')
        typo_queries = [
            'my break is not working',
            'car breaks are squeaking',
            'engne is overheating',
            'battery is not working',
            'my tyre is flat'
        ]

        for query in typo_queries:
            data = {
                'session_id': self.session.session_id,
                'message': query
            }
            response = self.client.post(url, data, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertFalse(response.data['is_rejected'], f"Query '{query}' should NOT be marked as rejected!")

    def test_media_upload_endpoint(self):
        """Verify image/media upload endpoint."""
        url = reverse('upload')
        small_gif = (
            b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00'
            b'\xff\xff\xff\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00'
            b'\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
        )
        uploaded = SimpleUploadedFile("car_engine.gif", small_gif, content_type="image/gif")
        response = self.client.post(url, {'file': uploaded}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['file_type'], 'image')
        self.assertIn('file_url', response.data)

    def test_media_upload_analysis_and_repair_recommendation(self):
        """Verify uploading image media triggers media analysis report and suggests appropriate repair/service."""
        # 1. Upload media file
        small_gif = (
            b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00'
            b'\xff\xff\xff\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00'
            b'\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
        )
        file_obj = SimpleUploadedFile("engine_coolant_leak.gif", small_gif, content_type="image/gif")
        media_res = self.client.post(reverse('upload'), {'file': file_obj}, format='multipart')
        media_id = media_res.data['id']

        # 2. Send chat message referencing media upload
        chat_res = self.client.post(reverse('chat'), {
            'session_id': self.session.session_id,
            'message': 'Please inspect this photo of engine coolant dripping from my car hose',
            'media_id': media_id
        }, format='json')

        self.assertEqual(chat_res.status_code, status.HTTP_200_OK)
        self.assertFalse(chat_res.data['is_rejected'])
        self.assertIn('MEDIA ANALYSIS REPORT', chat_res.data['reply'])
        self.assertIn('Recommended Repair/Service', chat_res.data['reply'])
        self.assertIsNotNone(chat_res.data['diagnosis'])
        self.assertIn('Cooling System', chat_res.data['diagnosis']['recommended_repair'])

    def test_diagnosis_endpoint(self):
        """Verify POST /api/diagnosis/ creates diagnosis record."""
        url = reverse('diagnosis')
        data = {
            'session_id': self.session.session_id,
            'issue_summary': 'Worn Front Brake Pads',
            'severity': 'high',
            'recommended_repair': 'Replace front brake pads and resurface rotors',
            'estimated_cost': '$220',
            'estimated_time': '1.5 hours'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['issue_summary'], 'Worn Front Brake Pads')
        self.assertEqual(response.data['severity'], 'high')

    def test_booking_create_and_detail_endpoints(self):
        """Verify POST /api/booking/ and GET /api/booking/{id}/."""
        # 1. Create diagnosis first
        diag = Diagnosis.objects.create(
            session=self.session,
            issue_summary="Coolant leak",
            severity="medium",
            recommended_repair="Replace radiator top hose",
            estimated_cost="$150",
            estimated_time="1 hour"
        )

        booking_url = reverse('booking-create')
        booking_data = {
            'session_id': self.session.session_id,
            'diagnosis_id': diag.id,
            'customer_name': 'John Doe',
            'customer_email': 'john.doe@example.com',
            'customer_phone': '+1 555-0199',
            'vehicle_info': '2020 Toyota Camry',
            'service_requested': 'Replace Radiator Hose & Coolant Flush',
            'preferred_date': '2026-09-25',
            'preferred_time': '10:00 AM',
            'notes': 'Please call when ready.'
        }
        res_create = self.client.post(booking_url, booking_data, format='json')
        self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)
        booking_id = res_create.data['booking_id']
        self.assertEqual(res_create.data['status'], 'confirmed')

        # 2. Get booking detail
        detail_url = reverse('booking-detail', kwargs={'booking_id': booking_id})
        res_detail = self.client.get(detail_url)
        self.assertEqual(res_detail.status_code, status.HTTP_200_OK)
        self.assertEqual(res_detail.data['customer_name'], 'John Doe')
        self.assertEqual(res_detail.data['vehicle_info'], '2020 Toyota Camry')
