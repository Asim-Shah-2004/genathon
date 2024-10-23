from django.urls import path
from .views import (
    AudioUploadView,
    TranslateTranscriptView,
    SummaryView,
    KeyPointsView,
    OffensiveDetectionView,
)

urlpatterns = [
    path('upload/', AudioUploadView.as_view(), name='audio-upload'),
    path('translate/', TranslateTranscriptView.as_view(), name='translate-transcript'),
    path('summary/', SummaryView.as_view(), name='summary'),
    path('keypoints/', KeyPointsView.as_view(), name='key-points'),
    path('offensive/', OffensiveDetectionView.as_view(), name='offensive-detection'),
]
