import uuid
from django.db import models

class ChatSession(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('diagnosed', 'Diagnosed'),
        ('booked', 'Booked'),
    )

    session_id = models.CharField(max_length=64, unique=True, default=uuid.uuid4, primary_key=True)
    car_make = models.CharField(max_length=100, blank=True, default='')
    car_model = models.CharField(max_length=100, blank=True, default='')
    car_year = models.CharField(max_length=10, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Session {self.session_id} - {self.car_make} {self.car_model} ({self.status})"


class MediaUpload(models.Model):
    MEDIA_TYPES = (
        ('image', 'Image'),
        ('audio', 'Audio'),
        ('video', 'Video'),
        ('file', 'File'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to='chat_uploads/%Y/%m/%d/')
    file_type = models.CharField(max_length=10, choices=MEDIA_TYPES, default='file')
    mime_type = models.CharField(max_length=100, blank=True, default='')
    original_name = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_type.capitalize()} Upload ({self.original_name or self.id})"


class ChatMessage(models.Model):
    SENDER_CHOICES = (
        ('user', 'User'),
        ('bot', 'Bot'),
        ('system', 'System'),
    )

    session = models.ForeignKey(ChatSession, related_name='messages', on_delete=models.CASCADE)
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    content = models.TextField()
    media = models.ForeignKey(MediaUpload, null=True, blank=True, on_delete=models.SET_NULL, related_name='messages')
    is_rejected = models.BooleanField(default=False, help_text="True if query was rejected as off-topic")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.sender}] {self.content[:30]}"


class Diagnosis(models.Model):
    SEVERITY_CHOICES = (
        ('low', 'Low - Minor Issue / Maintenance'),
        ('medium', 'Medium - Inspection Recommended'),
        ('high', 'High - Immediate Attention Required'),
        ('critical', 'Critical - Do Not Drive'),
    )

    session = models.OneToOneField(ChatSession, related_name='diagnosis', on_delete=models.CASCADE)
    issue_summary = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium')
    confidence = models.CharField(max_length=50, default="85%")
    symptoms_detected = models.TextField(default="✓ Abnormal mechanical noise\n✓ Vehicle performance degradation\n✓ System fault detected")
    possible_cause = models.TextField(default="Mechanical component wear or fluid/electrical defect")
    recommended_action = models.TextField(default="Inspect vehicle components, fluid levels, and diagnostic fault codes")
    recommended_repair = models.TextField()
    estimated_cost = models.CharField(max_length=100, default="$150 - $350")
    estimated_time = models.CharField(max_length=100, default="1 - 2 hours")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Diagnosis for {self.session_id}: {self.issue_summary[:40]}"


class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Confirmation'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    )

    booking_id = models.CharField(max_length=64, unique=True, default=uuid.uuid4, primary_key=True)
    session = models.ForeignKey(ChatSession, related_name='bookings', on_delete=models.CASCADE, null=True, blank=True)
    diagnosis = models.ForeignKey(Diagnosis, related_name='bookings', on_delete=models.SET_NULL, null=True, blank=True)
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=30)
    car_company = models.CharField(max_length=100, blank=True, default='', help_text="Car company / manufacturer name (e.g. Toyota)")
    car_model = models.CharField(max_length=100, blank=True, default='', help_text="Car model name (e.g. Camry)")
    vehicle_info = models.CharField(max_length=200, help_text="e.g. 2020 Toyota Camry")
    vehicle_problem = models.TextField(blank=True, default='', help_text="Specific problem facing in vehicle")
    service_requested = models.TextField()
    preferred_date = models.DateField()
    preferred_time = models.CharField(max_length=50, default="10:00 AM")
    notes = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking {self.booking_id} - {self.customer_name} ({self.car_company} {self.car_model}: {self.vehicle_problem[:30]})"
