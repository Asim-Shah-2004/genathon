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
import datetime
import pandas as pd
import numpy as np
import re
import spacy
from typing import List, Dict, Tuple
import seaborn as sns
from textblob import TextBlob
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.sentiment import SentimentIntensityAnalyzer
from collections import Counter  # Import sentiment analysis pipeline
import uuid
from datetime import timedelta
import matplotlib
matplotlib.use('Agg')  # Set the backend to Agg before importing pyplot
import matplotlib.pyplot as plt
from threading import Lock

class ThreadSafePlotter:
    """Thread-safe wrapper for matplotlib plotting operations"""
    _lock = Lock()
    
    @staticmethod
    def create_plot(plot_function):
        """
        Creates a plot in a thread-safe manner
        
        Args:
            plot_function: Function that contains the matplotlib plotting commands
        """
        with ThreadSafePlotter._lock:
            # Create a new figure
            plt.figure()
            try:
                # Execute the plotting commands
                plot_function()
                # Save the plot
                plt.savefig(plot_function.output_path)
            finally:
                # Clean up
                plt.close('all')
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

    # def plot_detailed_analysis(self, df: pd.DataFrame, file_path: str):
    #     """Generate comprehensive visualizations for conversation analysis."""
    #     plot_dir = os.path.dirname(file_path)
    #     if not os.path.exists(plot_dir):
    #         os.makedirs(plot_dir)
    #     plt.style.use('seaborn')
    #     fig = plt.figure(figsize=(20, 15))
    #     gs = fig.add_gridspec(3, 3)

    # # Speaker Distribution
    #     ax1 = fig.add_subplot(gs[0, 0])
    #     sns.countplot(data=df, x='speaker', ax=ax1)
    #     ax1.set_title('Speaker Distribution')

    # # Sentiment Flow
    #     ax2 = fig.add_subplot(gs[0, 1:])
    #     df['sentiment_compound'].plot(ax=ax2, marker='o')
    #     ax2.set_title('Sentiment Flow Throughout Conversation')
    #     ax2.set_xlabel('Utterance Number')
    #     ax2.set_ylabel('Compound Sentiment')

    # # Positive vs Negative Sentiment per Speaker
    #     ax3 = fig.add_subplot(gs[1, 0])
    #     sns.barplot(data=df, x='speaker', y='sentiment_positive', color='green', label='Positive', ax=ax3)
    #     sns.barplot(data=df, x='speaker', y='sentiment_negative', color='red', label='Negative', ax=ax3)
    #     ax3.set_title('Positive vs Negative Sentiment by Speaker')
    #     ax3.legend()

    # # Word Count Distribution by Speaker
    #     ax4 = fig.add_subplot(gs[1, 1])
    #     sns.boxplot(data=df, x='speaker', y='word_count', ax=ax4)
    #     ax4.set_title('Word Count Distribution by Speaker')

    # # Sentiment Components (Positive, Negative, Neutral) Distribution
    #     ax5 = fig.add_subplot(gs[1, 2])
    #     sentiment_components = df[['sentiment_positive', 'sentiment_negative', 'sentiment_neutral']].mean()
    #     sentiment_components.plot(kind='pie', autopct='%1.1f%%', ax=ax5)
    #     ax5.set_title('Overall Sentiment Distribution')

    # # Emotion Distribution
    #     ax6 = fig.add_subplot(gs[2, 0])
    #     emotion_data = df[['anger_score', 'frustration_score', 'satisfaction_score', 'urgency_score']].mean()
    #     emotion_data.plot(kind='bar', ax=ax6)
    #     ax6.set_title('Average Emotion Scores')

    # # Intensity Metrics Over Time (Exclamations, Questions, Caps Ratio)
    #     ax7 = fig.add_subplot(gs[2, 1])
    #     df[['exclamation_count', 'question_count', 'caps_ratio']].plot(ax=ax7)
    #     ax7.set_title('Conversation Intensity Metrics Over Time')
    #     ax7.set_xlabel('Utterance Number')
    #     ax7.set_ylabel('Count/Ratio')
    #     ax7.legend(['Exclamations', 'Questions', 'Caps Ratio'])

    # # Compound Sentiment Distribution
    #     ax8 = fig.add_subplot(gs[2, 2])
    #     sns.histplot(df['sentiment_compound'], kde=True, ax=ax8, color='blue')
    #     ax8.set_title('Distribution of Compound Sentiment Scores')

    #     plt.tight_layout()
    #     plt.savefig(file_path)
    #     plt.close()

    def plot_detailed_analysis(self, df: pd.DataFrame, file_path: str):
        """Generate comprehensive visualizations for conversation analysis."""
        # Ensure the directory exists
        plot_dir = os.path.dirname(file_path)
        print("here1")
        if not os.path.exists(plot_dir):
            os.makedirs(plot_dir)
            
        # Set the style - using default style instead of seaborn
        plt.style.use('default')
        
        # Create separate plots for different metrics
        
        # 1. Speaker Distribution Plot
        plt.figure(figsize=(10, 6))
        speaker_counts = df['speaker'].value_counts()
        speaker_counts.plot(kind='bar')
        plt.title('Speaker Distribution')
        plt.xlabel('Speaker')
        plt.ylabel('Number of Messages')
        plt.tight_layout()
        speaker_plot_path = os.path.join(plot_dir, 'speaker_distribution.png')
        plt.savefig(speaker_plot_path)
        plt.close()
        
        # 2. Sentiment Flow
        plt.figure(figsize=(12, 6))
        plt.plot(range(len(df)), df['sentiment_compound'], marker='o')
        plt.title('Sentiment Flow Throughout Conversation')
        plt.xlabel('Message Number')
        plt.ylabel('Compound Sentiment')
        plt.grid(True)
        plt.tight_layout()
        sentiment_plot_path = os.path.join(plot_dir, 'sentiment_flow.png')
        plt.savefig(sentiment_plot_path)
        plt.close()
        
        # 3. Emotion Distribution
        plt.figure(figsize=(10, 6))
        emotion_data = df[['anger_score', 'frustration_score', 
                          'satisfaction_score', 'urgency_score']].mean()
        emotion_data.plot(kind='bar')
        plt.title('Average Emotion Scores')
        plt.xlabel('Emotions')
        plt.ylabel('Score')
        plt.xticks(rotation=45)
        plt.tight_layout()
        emotion_plot_path = os.path.join(plot_dir, 'emotion_distribution.png')
        plt.savefig(emotion_plot_path)
        plt.close()
        
        # 4. Word Count Distribution
        plt.figure(figsize=(10, 6))
        plt.boxplot([df[df['speaker'] == speaker]['word_count'] 
                    for speaker in df['speaker'].unique()],
                   labels=df['speaker'].unique())
        plt.title('Word Count Distribution by Speaker')
        plt.ylabel('Word Count')
        plt.tight_layout()
        wordcount_plot_path = os.path.join(plot_dir, 'word_count_distribution.png')
        plt.savefig(wordcount_plot_path)
        plt.close()
        
        # 5. Intensity Metrics
        plt.figure(figsize=(12, 6))
        intensity_metrics = df[['exclamation_count', 'question_count', 'caps_ratio']]
        plt.plot(range(len(df)), intensity_metrics)
        plt.title('Conversation Intensity Metrics')
        plt.xlabel('Message Number')
        plt.ylabel('Count/Ratio')
        plt.legend(['Exclamations', 'Questions', 'Caps Ratio'])
        plt.grid(True)
        plt.tight_layout()
        intensity_plot_path = os.path.join(plot_dir, 'intensity_metrics.png')
        plt.savefig(intensity_plot_path)
        plt.close()

    def plot_insights(self, insights: Dict, file_path: str):
        """Create visualization for the conversation insights."""
        plot_dir = os.path.dirname(file_path)
        if not os.path.exists(plot_dir):
            os.makedirs(plot_dir)
            
        plt.style.use('default')
        
        # Create a summary plot
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
        
        # 1. Speaker Distribution
        speakers = insights['conversation_metrics']['speaker_distribution']
        ax1.bar(speakers.keys(), speakers.values())
        ax1.set_title('Speaker Distribution')
        ax1.set_ylabel('Number of Messages')
        
        # 2. Emotion Metrics
        emotions = insights['emotion_metrics']
        ax2.bar(emotions.keys(), emotions.values())
        ax2.set_title('Emotion Metrics')
        ax2.tick_params(axis='x', rotation=45)
        
        # 3. Speaker Metrics Comparison
        speaker_metrics = insights['speaker_metrics']
        metrics = ['avg_sentiment', 'avg_word_count']
        x = range(len(metrics))
        width = 0.35
        ax3.bar([i - width/2 for i in x], 
                [speaker_metrics['employee'][m] for m in metrics],
                width, label='Employee')
        ax3.bar([i + width/2 for i in x],
                [speaker_metrics['customer'][m] for m in metrics],
                width, label='Customer')
        ax3.set_title('Speaker Metrics Comparison')
        ax3.set_xticks(x)
        ax3.set_xticklabels(metrics)
        ax3.legend()
        
        # 4. Intensity Metrics
        intensity = insights['intensity_metrics']
        ax4.bar(intensity.keys(), intensity.values())
        ax4.set_title('Intensity Metrics')
        ax4.tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        plt.savefig(file_path)
        plt.close()
        

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

from datetime import datetime, timezone, timedelta
import uuid
import numpy as np
import os
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from pydub import AudioSegment
import matplotlib.pyplot as plt

import matplotlib
matplotlib.use('Agg')  # Set the backend to Agg before importing pyplot
import matplotlib.pyplot as plt
from threading import Lock
from datetime import datetime, timezone, timedelta
import uuid
import numpy as np
import os
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from pydub import AudioSegment

class ThreadSafePlotter:
    """Thread-safe wrapper for matplotlib plotting operations"""
    _lock = Lock()
    
    @staticmethod
    @staticmethod
    def create_plot(plot_function, *args, output_path: str):
        """Creates a plot in a thread-safe manner"""
        with ThreadSafePlotter._lock:
            plt.figure()
            try:
                # Call the plot function with the provided arguments
                plot_function(*args, file_path=output_path)  # Ensure to pass file_path correctly
                plt.close('all')
            except Exception as e:
                plt.close('all')
                raise e


def convert_numpy_types(obj):
    """Convert numpy types to native Python types for MongoDB compatibility."""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    return obj

class ProcessCallView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        plot_files = []  # Keep track of plot files to clean up
        audio_path = None

        try:
            # Extract JWT token from headers
            token = request.headers.get("Authorization", "").split(" ")[1]
            user_data = decode_jwt(token)
            email = user_data["email"]

            # Find the employee from the database
            employee = employees_collection.find_one({"email": email})
            if not employee:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            # Get the audio file
            audio_file = request.FILES.get('audio')
            if not audio_file:
                return Response({"error": "No audio file provided."}, status=status.HTTP_400_BAD_REQUEST)

            # Save the audio file temporarily
            audio_path = os.path.join("media", f"{uuid.uuid4()}_{audio_file.name}")
            os.makedirs(os.path.dirname(audio_path), exist_ok=True)
            with open(audio_path, 'wb+') as destination:
                for chunk in audio_file.chunks():
                    destination.write(chunk)

            # Calculate the audio length using pydub
            audio_segment = AudioSegment.from_file(audio_path)
            call_length = float(len(audio_segment) / 1000)  # Convert to seconds

            if call_length <= 0:
                return Response({"error": "Call length must be greater than zero."}, status=status.HTTP_400_BAD_REQUEST)

            # Transcribe the audio
            result = whisper_model.transcribe(audio_path)
            transcript = result["text"]

            # Generate English translation and analysis using Gemini
            english_translation = chat_model.invoke([{"role": "user", "content": transcript}]).content
            summary = chat_model.invoke([{
                "role": "user", 
                "content": f"Provide a detailed summary of the following call: {english_translation}"
            }]).content
            key_points = chat_model.invoke([{
                "role": "user", 
                "content": f"Provide key points for the following call: {english_translation}"
            }]).content
            offensive_check = "offensive" in english_translation.lower()

            # Calculate sentiment using multiple models
            sentiments = {}
            for model_name, model in sentiment_models.items():
                result = model(transcript)[0]
                sentiments[model_name] = str(result["label"])

            # Generate satisfaction score using Gemini
            satisfaction_score = float(chat_model.invoke([{
                "role": "user",
                "content": f"Based on the summary and transcript, provide a satisfaction score (1-100):\n\nSummary: {summary}\nTranscript: {transcript}. Give only a value no text please."
            }]).content)

            # Initialize CustomerServiceAnalyzer and process transcript
            analyzer = CustomerServiceAnalyzer()
            conversation_df = analyzer.analyze_conversation(transcript)
            detailed_insights = analyzer.generate_detailed_insights(conversation_df)

            # Generate and save plots
            plot_dir = os.path.join('static', 'plots')
            os.makedirs(plot_dir, exist_ok=True)

            # Create unique filenames for plots
            plot_filename1 = f'detailed_analysis_{uuid.uuid4()}.png'
            plot_filename2 = f'insights_summary_{uuid.uuid4()}.png'
            detailed_analysis_path = os.path.join(plot_dir, plot_filename1)
            insights_summary_path = os.path.join(plot_dir, plot_filename2)
            
            # Create plots
            ThreadSafePlotter.create_plot(
                analyzer.plot_detailed_analysis,
                conversation_df,
                output_path=detailed_analysis_path
            )

            ThreadSafePlotter.create_plot(
                analyzer.plot_insights,
                detailed_insights,
                output_path=insights_summary_path
            )
            
            plot_files.extend([detailed_analysis_path, insights_summary_path])

            # Convert DataFrame to dict and ensure all numpy types are converted
            conversation_analysis = [
                convert_numpy_types(record) 
                for record in conversation_df.to_dict('records')
            ]

            current_time = datetime.now(timezone.utc)

            # Prepare Call data with all analytics
            call_data = {
                "type": request.data.get("type", "incoming"),
                "length": call_length,
                "timestamp": current_time,
                "employeeId": employee["_id"],
                "callRecording": audio_file.read(),
                "sentiment": sentiments,
                "transcriptOriginal": transcript,
                "transcriptEnglish": english_translation,
                "keyPoints": key_points.split(", "),
                "offensiveContent": offensive_check,
                "summary": summary,
                "satisfactionScore": satisfaction_score,
                "conversationAnalysis": {
                    "detailed_insights": convert_numpy_types(detailed_insights),
                    "conversation_metrics": conversation_analysis,
                    "plot_paths": {
                        "detailed_analysis": detailed_analysis_path,
                        "insights_summary": insights_summary_path
                    }
                },
                "metrics": {
                    "average_confidence": float(conversation_df['confidence'].mean()),
                    "sentiment_progression": convert_numpy_types(conversation_df['sentiment_compound'].tolist()),
                    "speaker_distribution": convert_numpy_types(conversation_df['speaker'].value_counts().to_dict()),
                    "response_times": convert_numpy_types(conversation_df['response_time'].tolist() if 'response_time' in conversation_df else [])
                }
            }

            # Insert the call into the Call collection
            call_id = calls_collection.insert_one(call_data).inserted_id

            # Calculate aggregate metrics for employee update
            avg_sentiment = float(np.mean([float(s) for s in conversation_df['sentiment_compound']]))
            total_interactions = int(len(conversation_df))

            # Update the Employee with comprehensive metrics
            employee_update = {
                "$push": {
                    "callIds": call_id,
                    "sentimentHistory": avg_sentiment,
                    "satisfactionScores": satisfaction_score,
                    "callLengths": call_length
                },
                "$inc": {
                    "numberOfCalls": 1,
                    "numberOfIncoming": 1 if call_data["type"] == "incoming" else 0,
                    "numberOfOutgoing": 1 if call_data["type"] == "outgoing" else 0,
                    "numberOfMisbehaves": 1 if offensive_check else 0,
                    "totalCallTime": call_length,
                    "totalInteractions": total_interactions
                },
                "$set": {
                    "lastCallDate": current_time,
                    "averageSentiment": avg_sentiment,
                    "averageSatisfactionScore": satisfaction_score,
                    "averageCallLength": call_length,
                    "longestCall": {
                        "callId": call_id,
                        "length": call_length,
                        "timestamp": current_time,
                        "details": {
                            "summary": summary,
                            "satisfactionScore": satisfaction_score,
                            "sentiment": sentiments
                        }
                    } if (employee.get("longestCall") is None or call_length > employee["longestCall"]["length"]) else employee["longestCall"],
                    "shortestCall": {
                        "callId": call_id,
                        "length": call_length,
                        "timestamp": current_time,
                        "details": {
                            "summary": summary,
                            "satisfactionScore": satisfaction_score,
                            "sentiment": sentiments
                        }
                    } if (employee.get("shortestCall") is None or call_length < employee["shortestCall"]["length"]) else employee["shortestCall"]
                }
            }

            # Apply the main update
            employees_collection.update_one(
                {"_id": employee["_id"]},
                employee_update
            )

            return Response({
                "message": "Call processed successfully",
                "callId": str(call_id),
                "analytics": {
                    "satisfactionScore": float(satisfaction_score),
                    "averageSentiment": float(avg_sentiment),
                    "totalInteractions": int(total_interactions),
                    "callLength": float(call_length)
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "error": f"Error processing call: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        finally:
            # Clean up resources
            try:
                if audio_path and os.path.exists(audio_path):
                    os.remove(audio_path)
            except Exception as e:
                print(f"Error removing audio file: {e}")

            # Clean up plot files
            for plot_file in plot_files:
                try:
                    if os.path.exists(plot_file):
                        os.remove(plot_file)
                except Exception as e:
                    print(f"Error removing plot file: {e}")
