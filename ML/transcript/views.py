import os
import whisper
import jwt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import AIMessage
from decouple import config
from pymongo import MongoClient

# MongoDB setup
DATABASE_URL = config("DATABASE_URL")
JWT_SECRET = config("JWT_SECRET")

mongo_client = MongoClient(DATABASE_URL)
db = mongo_client["Genathon"]
employees_collection = db["Employee"]
calls_collection = db["Call"]

# Whisper and Gemini setup
whisper_model = whisper.load_model("small")
api_key = config('API_KEY')
chat_model = ChatGoogleGenerativeAI(api_key=api_key, model="gemini-pro")

def decode_jwt(token):
    """Decodes the JWT token to get user info."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise Exception("Token has expired")
    except jwt.InvalidTokenError:
        raise Exception("Invalid Token")

class ProcessCallView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        # Extract JWT token from headers
        token = request.headers.get("Authorization", "").split(" ")[1]
        user_data = decode_jwt(token)
        username = user_data["username"]
        
        # Find the employee from the database
        employee = employees_collection.find_one({"username": username})
        if not employee:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Get the audio file
        audio_file = request.FILES.get('audio')
        print(audio_file)
        if not audio_file:
            return Response({"error": "No audio file provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Save the audio file temporarily
        audio_path = os.path.join("media", str(audio_file))
        with open(audio_path, 'wb+') as destination:
            for chunk in audio_file.chunks():
                destination.write(chunk)

        # Transcribe the audio
        result = whisper_model.transcribe(audio_path)
        transcript = result["text"]

        # Generate English translation and analysis using Gemini
        english_translation = chat_model.invoke([{"role": "system", "content": f" You are an expert English translator proficient in translating from any language into English. Your task is to accurately convey the original meaning, tone, and cultural nuances of the source text while ensuring clarity and readability for an English-speaking audience. {transcript}"}]).content
        summary = chat_model.invoke([{"role": "system", "content": f"You are an expert summarizer skilled in distilling complex texts into concise, clear summaries. Your task is to extract the main ideas, key points, and essential details from the provided content while maintaining the original tone and intent. Ensure the summary is easy to understand and captures the essence of the source material.: {english_translation}"}]).content
        key_points = chat_model.invoke([{"role": "system", "content": f"You are an expert summarizer who excels at extracting key points from any text. Your task is to identify and present the most important information, main ideas, and critical details in a clear and concise format. Ensure that the key points reflect the essence of the original content while remaining easily understandable for the intended audience.: {english_translation}"}]).content
        offensive_check = chat_model.invoke([{"role": "system", "content": f"You are an advanced offensive word checker capable of identifying inappropriate or offensive language in any text. Your task is to analyze the provided content and highlight any offensive words or phrases, along with a brief explanation of why each term is considered offensive. : {english_translation}"}])

        # Prepare Call data
        call_data = {
            "type": request.data.get("type", "incoming"),  # Incoming or Outgoing
            "length": int(request.data.get("length", 0)),  # Call length in seconds
            "callRecording": audio_file.read(),
            "sentiment": "neutral",  # Example: Add actual sentiment analysis logic
            "transcriptOriginal": transcript,
            "transcriptEnglish": english_translation,
            "keyPoints": key_points.split(", "),
            "offensiveContent": offensive_check,
            "summary": summary
        }

        # Insert the call into the Call collection
        call_id = calls_collection.insert_one(call_data).inserted_id

        # Update the Employee with the new call ID and increment counters
        employees_collection.update_one(
            {"_id": employee["_id"]},
            {
                "$push": {"callIds": call_id},
                "$inc": {
                    "numberOfCalls": 1,
                    "numberOfIncoming" if call_data["type"] == "incoming" else "numberOfOutgoing": 1,
                    "numberOfMisbehaves": 1 if offensive_check else 0
                }
            }
        )

        # Clean up the saved audio file
        os.remove(audio_path)

        return Response({"message": "Call processed successfully"}, status=status.HTTP_200_OK)
