import os
import whisper
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import AIMessage
from decouple import config
from googletrans import Translator  # Make sure to install googletrans if needed

# Load Whisper model
whisper_model = whisper.load_model("small")

# Initialize Google Gemini Chat model
api_key = config('API_KEY')
chat_model = ChatGoogleGenerativeAI(api_key=api_key, model="gemini-pro")

class AudioUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        # Print incoming request data for debugging
        print("Request data:", request.data)

        # Get the audio file from the request
        audio_file = request.FILES.get('audio')
        if not audio_file:
            return Response({"error": "No audio file provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Define media directory path
        media_directory = "media"
        
        # Check if the media directory exists, if not, create it
        if not os.path.exists(media_directory):
            os.makedirs(media_directory)

        # Save the audio file to the media directory
        audio_path = os.path.join(media_directory, audio_file.name)
        with open(audio_path, 'wb+') as destination:
            for chunk in audio_file.chunks():
                destination.write(chunk)

        # Transcribe the audio using Whisper
        result = whisper_model.transcribe(audio_path)
        transcript = result["text"]
        return Response({"transcript": transcript}, status=status.HTTP_200_OK)

# class TranslateTranscriptView(APIView):
#     def post(self, request, *args, **kwargs):
#         transcript = request.data.get('transcript')
#         if not transcript:
#             return Response({"error": "No transcript provided."}, status=status.HTTP_400_BAD_REQUEST)

#         translator = Translator()
#         translated_text = translator.translate(transcript, dest='en').text
#         return Response({"translated_transcript": translated_text}, status=status.HTTP_200_OK)

from deep_translator import GoogleTranslator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import AIMessage
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from decouple import config

# Initialize Google Gemini Chat model
api_key = config('API_KEY')  # Load API key from environment variables
chat_model = ChatGoogleGenerativeAI(api_key=api_key, model="gemini-pro")

class TranslateTranscriptView(APIView):
    def post(self, request, *args, **kwargs):
        transcript = request.data.get("transcript")
        target_language = request.data.get("target_language", "English")  # Default to English

        if not transcript:
            return Response({"error": "No transcript provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Construct prompt for translation using Gemini
            translation_prompt = (
                f"Translate the following text to {target_language}:\n\n{transcript}"
            )
            messages = [{"role": "user", "content": translation_prompt}]
            response = chat_model.invoke(messages)

            # Extract translated text from the response
            translated_text = response.content if isinstance(response, AIMessage) else str(response)

            return Response({"translated_text": translated_text}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SummaryView(APIView):
    def post(self, request, *args, **kwargs):
        english_transcript = request.data.get('transcript')
        if not english_transcript:
            return Response({"error": "No English transcript provided."}, status=status.HTTP_400_BAD_REQUEST)

        summary_prompt = f"Please summarize the following conversation:\n\n{english_transcript}"
        messages = [{"role": "user", "content": summary_prompt}]
        summary_response = chat_model.invoke(messages)
        summary = summary_response.content if isinstance(summary_response, AIMessage) else str(summary_response)

        return Response({"summary": summary}, status=status.HTTP_200_OK)

class KeyPointsView(APIView):
    def post(self, request, *args, **kwargs):
        english_transcript = request.data.get('transcript')
        if not english_transcript:
            return Response({"error": "No English transcript provided."}, status=status.HTTP_400_BAD_REQUEST)

        key_points_prompt = f"Please extract key points from the following conversation:\n\n{english_transcript}"
        messages = [{"role": "user", "content": key_points_prompt}]
        key_points_response = chat_model.invoke(messages)
        key_points = key_points_response.content if isinstance(key_points_response, AIMessage) else str(key_points_response)

        return Response({"key_points": key_points}, status=status.HTTP_200_OK)

class OffensiveDetectionView(APIView):
    def post(self, request, *args, **kwargs):
        english_transcript = request.data.get('transcript')
        if not english_transcript:
            return Response({"error": "No English transcript provided."}, status=status.HTTP_400_BAD_REQUEST)

        # You can implement your own logic for detecting offensive content here.
        offensive_check_prompt = f"Please check the following conversation for offensive behavior:\n\n{english_transcript}"
        messages = [{"role": "user", "content": offensive_check_prompt}]
        detection_response = chat_model.invoke(messages)
        detection_result = detection_response.content if isinstance(detection_response, AIMessage) else str(detection_response)

        return Response({"offensive_detection": detection_result}, status=status.HTTP_200_OK)

