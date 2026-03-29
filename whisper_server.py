"""
Whisper Speech-to-Text Server
Run this locally to transcribe audio without API costs

Installation:
    pip install flask flask-cors openai-whisper

Run:
    python whisper_server.py

The server will start on http://localhost:5000
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import tempfile
import os
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Load Whisper model (base model - ~140MB, small but fast)
# Options: tiny, base, small, medium, large
MODEL_NAME = os.environ.get('WHISPER_MODEL', 'base')
print(f"Loading Whisper model: {MODEL_NAME}...")
model = whisper.load_model(MODEL_NAME)
print("Whisper model loaded successfully!")

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    """
    Transcribe audio file
    Accepts: JSON with 'audio' (base64) or 'language' field
    Returns: JSON with 'text' transcription
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Get audio data (base64 encoded)
        audio_base64 = data.get('audio')
        language = data.get('language', 'en')  # Default to English
        
        if not audio_base64:
            return jsonify({'error': 'No audio data provided'}), 400
        
        # Decode base64 audio
        try:
            audio_data = base64.b64decode(audio_base64)
        except Exception as e:
            return jsonify({'error': f'Invalid base64 audio: {str(e)}'}), 400
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp_file:
            tmp_file.write(audio_data)
            tmp_path = tmp_file.name
        
        try:
            # Transcribe
            result = model.transcribe(
                tmp_path,
                language=language,
                fp16=False  # Use fp16=True if you have GPU
            )
            
            text = result['text'].strip()
            
            return jsonify({
                'success': True,
                'text': text,
                'language': language
            })
            
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
                
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': MODEL_NAME
    })


@app.route('/', methods=['GET'])
def index():
    """Server info"""
    return jsonify({
        'name': 'Whisper Speech-to-Text Server',
        'model': MODEL_NAME,
        'endpoints': {
            'transcribe': '/api/transcribe (POST)',
            'health': '/api/health (GET)'
        }
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"\n🚀 Whisper server running on http://localhost:{port}")
    print(f"📝 Model: {MODEL_NAME}")
    print(f"\nTest with:")
    print(f"  curl -X POST http://localhost:{port}/api/health")
    app.run(host='0.0.0.0', port=port, debug=True)
