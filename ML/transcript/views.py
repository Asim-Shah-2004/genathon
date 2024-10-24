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
from pydub import AudioSegment  # Import pydub for audio manipulation
from transformers import pipeline

import pandas as pd
import numpy as np
import re
import spacy
from typing import List, Dict, Tuple
import matplotlib.pyplot as plt
import seaborn as sns
from textblob import TextBlob
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.sentiment import SentimentIntensityAnalyzer
from collections import Counter  # Import sentiment analysis pipeline

class CustomerServiceAnalyzer:
    def __init__(self):
        self.sia = SentimentIntensityAnalyzer()

        # Enhanced employee indicators
        self.employee_indicators = {
            'protocol_phrases': [
                "thank you for calling",
                "how may i help",
                "how can i help",
                "is there anything else",
                "let me check",
                "one moment please",
                "according to",
                "i understand",
                "i apologize",
                "i'm sorry to hear",
                "let me assist you",
                "company policy",
                "standard protocol",
                "i'm here to help",
                "please allow me",
                "would you mind",
                "may i have",
                "could you please provide",
                "following up on",
                "as mentioned earlier",
                "for security purposes",
                "let me explain",
                "certainly",
                "absolutely",
                "i'll look into this",
                "please bear with me",
                "i appreciate your patience",
                "rest assured"
            ],

            'technical_terms': [
                "system",
                "database",
                "order number",
                "reference number",
                "tracking number",
                "account",
                "verification",
                "fedex",
                "warehouse",
                "inventory",
                "dropship",
                "investigation",
                "claim",
                "pdnr",
                "escalation",
                "protocol",
                "procedure",
                "logistics",
                "processing",
                "authorization",
                "validation",
                "confirmation",
                "documentation"
            ],

            'professional_phrases': [
                "i would recommend",
                "i suggest",
                "alternatively",
                "as mentioned",
                "regarding your",
                "in reference to",
                "to assist you",
                "please confirm",
                "please verify",
                "kindly note",
                "for your reference",
                "as per our policy",
                "at your earliest convenience",
                "please be advised",
                "for clarification",
                "in this case"
            ]
        }

        # Enhanced customer indicators
        self.customer_indicators = {
            'complaint_phrases': [
                "haven't received",
                "still waiting",
                "not delivered",
                "where is",
                "missing",
                "delayed",
                "late",
                "wrong",
                "mistake",
                "error",
                "failed",
                "terrible",
                "awful",
                "horrible",
                "worst",
                "ridiculous",
                "unbelievable",
                "disappointed",
                "frustrated",
                "unacceptable",
                "poor service",
                "waste of time",
                "not working",
                "broken",
                "damaged",
                "defective",
                "false advertising",
                "misleading",
                "scam"
            ],

            'personal_indicators': [
                "my order",
                "my package",
                "my delivery",
                "my account",
                "my tracking",
                "i paid",
                "i ordered",
                "i want",
                "i need",
                "my money",
                "my time",
                "my request",
                "my issue",
                "my problem",
                "my situation",
                "my experience",
                "my complaint",
                "my receipt"
            ],

            'emotional_phrases': [
                "frustrated",
                "angry",
                "upset",
                "disappointed",
                "annoyed",
                "fed up",
                "waste of time",
                "unhappy",
                "this is ridiculous",
                "can't believe",
                "outrageous",
                "furious",
                "disgusted",
                "insulting",
                "offensive",
                "pathetic",
                "incompetent",
                "useless",
                "never again",
                "last time"
            ],

            'urgency_indicators': [
                "asap",
                "urgent",
                "emergency",
                "immediately",
                "right now",
                "straight away",
                "as soon as possible",
                "critical",
                "pressing",
                "deadline",
                "time sensitive"
            ]
        }

    def preprocess_text(self, text: str) -> str:
        """Clean and preprocess the text."""
        text = text.lower()
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^a-zA-Z0-9\s.,!?]', '', text)
        return text.strip()

    def split_into_utterances(self, transcript: str) -> list[str]:
        """Split the transcript into individual utterances."""
        utterances = sent_tokenize(transcript)
        final_utterances = []
        for utterance in utterances:
            sub_utterances = re.split(r'(?<=[.!?])\s+(?=[A-Z])', utterance)
            final_utterances.extend([u.strip() for u in sub_utterances if u.strip()])
        return final_utterances

    def get_detailed_sentiment_analysis(self, text: str) -> Dict:
        """Get detailed sentiment analysis including emotion classification."""
        basic_scores = self.sia.polarity_scores(text)

        words = word_tokenize(text.lower())
        exclamation_count = text.count('!')
        question_count = text.count('?')
        caps_count = sum(1 for c in text if c.isupper())

        emotion_scores = {
            'anger': sum(word in words for word in ['angry', 'mad', 'furious', 'outraged']),
            'frustration': sum(word in words for word in ['frustrated', 'annoying', 'difficult']),
            'satisfaction': sum(word in words for word in ['happy', 'satisfied', 'pleased']),
            'urgency': sum(word in words for word in ['urgent', 'asap', 'immediately'])
        }

        return {
            'basic_sentiment': basic_scores,
            'intensity_metrics': {
                'exclamation_count': exclamation_count,
                'question_count': question_count,
                'caps_ratio': caps_count / len(text) if len(text) > 0 else 0
            },
            'emotion_scores': emotion_scores
        }

    def classify_speaker(self, utterance: str) -> Tuple[str, float]:
        """Classify whether an utterance is from the employee or customer."""
        text = self.preprocess_text(utterance)

        employee_score = 0
        customer_score = 0

        for category in self.employee_indicators.values():
            for phrase in category:
                if phrase in text:
                    employee_score += 1

        for category in self.customer_indicators.values():
            for phrase in category:
                if phrase in text:
                    customer_score += 1

        if re.search(r'may i|could you please|would you mind', text):
            employee_score += 0.5

        if re.search(r'[!]{2,}|\?{2,}', utterance):
            customer_score += 0.5

        if re.search(r'my\s+\w+', text):
            customer_score += 0.5

        if re.search(r'according to|as per|please be advised', text):
            employee_score += 0.5

        total_score = employee_score + customer_score
        confidence = 0.5 if total_score == 0 else max(employee_score, customer_score) / total_score

        speaker = "Employee" if employee_score > customer_score else "Customer"

        return speaker, confidence

    def analyze_conversation(self, transcript: str) -> pd.DataFrame:
        """Analyze the full conversation."""
        utterances = self.split_into_utterances(transcript)

        conversation_data = []
        for i, utterance in enumerate(utterances):
            speaker, confidence = self.classify_speaker(utterance)
            detailed_sentiment = self.get_detailed_sentiment_analysis(utterance)

            data = {
                'utterance_id': i + 1,
                'speaker': speaker,
                'confidence': confidence,
                'text': utterance,
                'word_count': len(utterance.split()),
                'char_count': len(utterance),
                'contains_question': '?' in utterance,
                'contains_exclamation': '!' in utterance,
                'sentiment_compound': detailed_sentiment['basic_sentiment']['compound'],
                'sentiment_positive': detailed_sentiment['basic_sentiment']['pos'],
                'sentiment_negative': detailed_sentiment['basic_sentiment']['neg'],
                'sentiment_neutral': detailed_sentiment['basic_sentiment']['neu'],
                'exclamation_count': detailed_sentiment['intensity_metrics']['exclamation_count'],
                'question_count': detailed_sentiment['intensity_metrics']['question_count'],
                'caps_ratio': detailed_sentiment['intensity_metrics']['caps_ratio'],
                'anger_score': detailed_sentiment['emotion_scores']['anger'],
                'frustration_score': detailed_sentiment['emotion_scores']['frustration'],
                'satisfaction_score': detailed_sentiment['emotion_scores']['satisfaction'],
                'urgency_score': detailed_sentiment['emotion_scores']['urgency']
            }
            conversation_data.append(data)

        return pd.DataFrame(conversation_data)

    def plot_detailed_analysis(self, df: pd.DataFrame):
        """Generate comprehensive visualizations for conversation analysis."""
        plt.style.use('seaborn')
        fig = plt.figure(figsize=(20, 15))
        gs = fig.add_gridspec(3, 3)

    # Speaker Distribution
        ax1 = fig.add_subplot(gs[0, 0])
        sns.countplot(data=df, x='speaker', ax=ax1)
        ax1.set_title('Speaker Distribution')

    # Sentiment Flow
        ax2 = fig.add_subplot(gs[0, 1:])
        df['sentiment_compound'].plot(ax=ax2, marker='o')
        ax2.set_title('Sentiment Flow Throughout Conversation')
        ax2.set_xlabel('Utterance Number')
        ax2.set_ylabel('Compound Sentiment')

    # Positive vs Negative Sentiment per Speaker
        ax3 = fig.add_subplot(gs[1, 0])
        sns.barplot(data=df, x='speaker', y='sentiment_positive', color='green', label='Positive', ax=ax3)
        sns.barplot(data=df, x='speaker', y='sentiment_negative', color='red', label='Negative', ax=ax3)
        ax3.set_title('Positive vs Negative Sentiment by Speaker')
        ax3.legend()

    # Word Count Distribution by Speaker
        ax4 = fig.add_subplot(gs[1, 1])
        sns.boxplot(data=df, x='speaker', y='word_count', ax=ax4)
        ax4.set_title('Word Count Distribution by Speaker')

    # Sentiment Components (Positive, Negative, Neutral) Distribution
        ax5 = fig.add_subplot(gs[1, 2])
        sentiment_components = df[['sentiment_positive', 'sentiment_negative', 'sentiment_neutral']].mean()
        sentiment_components.plot(kind='pie', autopct='%1.1f%%', ax=ax5)
        ax5.set_title('Overall Sentiment Distribution')

    # Emotion Distribution
        ax6 = fig.add_subplot(gs[2, 0])
        emotion_data = df[['anger_score', 'frustration_score', 'satisfaction_score', 'urgency_score']].mean()
        emotion_data.plot(kind='bar', ax=ax6)
        ax6.set_title('Average Emotion Scores')

    # Intensity Metrics Over Time (Exclamations, Questions, Caps Ratio)
        ax7 = fig.add_subplot(gs[2, 1])
        df[['exclamation_count', 'question_count', 'caps_ratio']].plot(ax=ax7)
        ax7.set_title('Conversation Intensity Metrics Over Time')
        ax7.set_xlabel('Utterance Number')
        ax7.set_ylabel('Count/Ratio')
        ax7.legend(['Exclamations', 'Questions', 'Caps Ratio'])

    # Compound Sentiment Distribution
        ax8 = fig.add_subplot(gs[2, 2])
        sns.histplot(df['sentiment_compound'], kde=True, ax=ax8, color='blue')
        ax8.set_title('Distribution of Compound Sentiment Scores')

        plt.tight_layout()
        return fig

    def generate_detailed_insights(self, df: pd.DataFrame) -> Dict:
        """Generate comprehensive insights."""
        insights = {
            'conversation_metrics': {
                'total_utterances': len(df),
                'speaker_distribution': df['speaker'].value_counts().to_dict(),
                'average_sentiment': df['sentiment_compound'].mean(),
                'sentiment_volatility': df['sentiment_compound'].std(),
                'average_word_count': df['word_count'].mean()
            },
            'emotion_metrics': {
                'average_anger': df['anger_score'].mean(),
                'average_frustration': df['frustration_score'].mean(),
                'average_satisfaction': df['satisfaction_score'].mean(),
                'average_urgency': df['urgency_score'].mean()
            },
            'intensity_metrics': {
                'total_questions': df['question_count'].sum(),
                'total_exclamations': df['exclamation_count'].sum(),
                'average_caps_ratio': df['caps_ratio'].mean()
            },
            'speaker_metrics': {
                'employee': {
                    'avg_sentiment': df[df['speaker'] == 'Employee']['sentiment_compound'].mean(),
                    'avg_word_count': df[df['speaker'] == 'Employee']['word_count'].mean()
                },
                'customer': {
                    'avg_sentiment': df[df['speaker'] == 'Customer']['sentiment_compound'].mean(),
                    'avg_word_count': df[df['speaker'] == 'Customer']['word_count'].mean()
                }
            }
        }
        return insights


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

# Sentiment analysis models
sentiment_models = {
    "distilbert": pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english"),
    "nlptown": pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment"),
    "emotion": pipeline("sentiment-analysis", model="j-hartmann/emotion-english-distilroberta-base")
}

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
        if not audio_file:
            return Response({"error": "No audio file provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Save the audio file temporarily
        audio_path = os.path.join("media", audio_file.name)
        with open(audio_path, 'wb+') as destination:
            for chunk in audio_file.chunks():
                destination.write(chunk)

        # Calculate the audio length using pydub
        audio_segment = AudioSegment.from_file(audio_path)
        call_length = len(audio_segment) / 1000  # Length in seconds

        if call_length <= 0:
            return Response({"error": "Call length must be greater than zero."}, status=status.HTTP_400_BAD_REQUEST)

        # Transcribe the audio
        result = whisper_model.transcribe(audio_path)
        transcript = result["text"]

        # Generate English translation and analysis using Gemini
        english_translation = chat_model.invoke([{"role": "user", "content": transcript}]).content
        summary = chat_model.invoke([{"role": "user", "content": f"You are a call summarizer: You are given an English transcript of a call. Your task is to provide detailed summary: {english_translation}"}]).content
        key_points = chat_model.invoke([{"role": "user", "content": f"Key points detailed: {english_translation}"}]).content
        offensive_check = "offensive" in english_translation.lower()

        # Calculate sentiment using multiple models
        sentiments = {}
        for model_name, model in sentiment_models.items():
            sentiments[model_name] = model(transcript)[0]["label"]

        # Generate satisfaction score using Gemini based on the summary and transcript
        satisfaction_score = chat_model.invoke([{
            "role": "user",
            "content": f"Based on the following summary and transcript, provide a satisfaction score (1-100):\n\nSummary: {summary}\nTranscript: {transcript}. Give only a value no text please."
        }]).content

        # Prepare Call data
        call_data = {
            "type": request.data.get("type", "incoming"),  # Incoming or Outgoing
            "length": call_length,  # Call length in seconds
            "callRecording": audio_file.read(),
            "sentiment": sentiments,  # Store sentiment analysis results
            "transcriptOriginal": transcript,
            "transcriptEnglish": english_translation,
            "keyPoints": key_points.split(", "),
            "offensiveContent": offensive_check,
            "summary": summary,
            "satisfactionScore": satisfaction_score  # Store satisfaction score
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
                    "numberOfMisbehaves": 1 if offensive_check else 0,
                    "totalCallTime": call_length  # Increment total call time
                },
                "$set": {
                    "longestCall": {
                        "callId": call_id,
                        "length": call_length,
                        "details": call_data
                    } if (employee.get("longestCall") is None or call_length > employee["longestCall"]["length"]) else employee["longestCall"],
                    "shortestCall": {
                        "callId": call_id,
                        "length": call_length,
                        "details": call_data
                    } if (employee.get("shortestCall") is None or call_length < employee["shortestCall"]["length"]) else employee["shortestCall"]
                }
            }
        )

        # Clean up the saved audio file
        os.remove(audio_path)

        analyzer = CustomerServiceAnalyzer()

        # Process transcript and get results
        df = analyzer.analyze_conversation(transcript)

        # Generate detailed insights
        insights = analyzer.generate_detailed_insights(df)

        # Print formatted conversation with speaker labels and metrics
        print("=== Formatted Conversation Analysis ===\n")
        for _, row in df.iterrows():
            print(f"\n{row['speaker']} (Confidence: {row['confidence']:.2f})")
            print(f"Sentiment: {row['sentiment_compound']:.2f}")
            print(f"Text: {row['text']}")
            print("-" * 80)

        # Print insights
        print("\n=== Conversation Insights ===\n")
        for category, metrics in insights.items():
            print(f"\n{category.replace('_', ' ').title()}:")
            for key, value in metrics.items():
                print(f"  {key.replace('_', ' ').title()}: {value}")

        # Generate and display visualizations
        plt.style.use('seaborn')
        fig = analyzer.plot_detailed_analysis(df)
        plt.show()

        # Save results to CSV (optional)
        df.to_csv('conversation_analysis.csv', index=False)        

        return Response({"message": "Call processed successfully", "satisfactionScore": satisfaction_score}, status=status.HTTP_200_OK)
