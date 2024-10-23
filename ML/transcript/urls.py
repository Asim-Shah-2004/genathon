from django.urls import path
from .views import (
    # AudioUploadView,
    # TranslateTranscriptView,
    # SummaryView,
    # KeyPointsView,
    # OffensiveDetectionView,
    # AudioProcessingView,
    ProcessCallView
)

urlpatterns = [
    # path('upload/', AudioUploadView.as_view(), name='audio-upload'),
    # path('translate/', TranslateTranscriptView.as_view(), name='translate-transcript'),
    # path('summary/', SummaryView.as_view(), name='summary'),
    # path('keypoints/', KeyPointsView.as_view(), name='key-points'),
    # path('offensive/', OffensiveDetectionView.as_view(), name='offensive-detection'),
    # path('api/audio-process/', AudioProcessingView.as_view(), name='audio-process'),
    path('api/process_call/', ProcessCallView.as_view(), name='process_call'),
]
