import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
  type: {
    type: String, // "incoming" or "outgoing"
    required: true,
  },
  length: {
    type: Number, // call length in seconds
    required: true,
  },
  callRecording: {
    type: Buffer, // call recording as a buffer
    required: true,
  },
  sentiment: {
    type: String, // sentiment analysis result, e.g., "positive", "negative", "neutral"
    required: true,
  },
  transcriptOriginal: {
    type: String, // transcript in original language
    required: true,
  },
  transcriptEnglish: {
    type: String, // translated transcript in English
    required: true,
  },
  keyPoints: {
    type: [String], // array of key points from the call
  },
  offensiveContent: {
    type: Boolean, // indicates if the call contains offensive content
    default: false,
  },
  summary: {
    type: String, // summary of the call
  },
}, { collection: 'Call' });

const Call = mongoose.model('Call', callSchema);
export default Call;
