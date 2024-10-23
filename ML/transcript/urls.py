from django.urls import path
from .views import (
    AudioUploadView,
    TranslateTranscriptView,
    SummaryView,
    KeyPointsView,
    OffensiveDetectionView,
)

urlpatterns = [
    path('api/upload/', AudioUploadView.as_view(), name='audio-upload'),
    path('api/translate/', TranslateTranscriptView.as_view(), name='translate-transcript'),
    path('api/summary/', SummaryView.as_view(), name='summary'),
    path('api/keypoints/', KeyPointsView.as_view(), name='key-points'),
    path('api/offensive/', OffensiveDetectionView.as_view(), name='offensive-detection'),
]
