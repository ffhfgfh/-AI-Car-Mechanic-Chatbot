from django.urls import path
from . import views

urlpatterns = [
    path('', views.api_root_view, name='api-root'),
    # Required minimum endpoints as specified in PDF
    path('chat/', views.chat_view, name='chat'),
    path('upload/', views.upload_view, name='upload'),
    path('diagnosis/', views.diagnosis_view, name='diagnosis'),
    path('booking/', views.booking_create_view, name='booking-create'),
    path('booking/<str:booking_id>/', views.booking_detail_view, name='booking-detail'),

    # Session & history helper endpoints
    path('sessions/', views.session_list_create, name='session-list-create'),
    path('chat/<str:session_id>/', views.session_detail_view, name='session-detail'),
]
