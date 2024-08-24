from elevenlabs import Voice, VoiceSettings
from elevenlabs.client import ElevenLabs
from pydub import AudioSegment
import io
import os
from flask import Flask

app = Flask(__name__)

client = ElevenLabs(
    api_key="s333333k_44863793c" "f8052d8f817db3c86c6d0c217ecc3a302d1684f"
)


# audio_generator = client.generate(
#     text="Hello! how are you. My name is Bella.",
#     voice=Voice(
#         voice_id='EXAVITQu4vr4xnSDxMaL',
#         settings=VoiceSettings(stability=0.71, similarity_boost=0.5, style=0.0, use_speaker_boost=True)
#     )
# )
audio_generator = client.text_to_sound_effects.convert(
        text="Dog barking",
        duration_seconds=10,  # Optional, if not provided will automatically determine the correct length
        prompt_influence=0.3,  # Optional, if not provided will use the default value of 0.3
    )
# Convert the generator output to bytes
audio_bytes = b''.join(chunk for chunk in audio_generator)

# Convert audio to AudioSegment
try:
    audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format="mp3")
except Exception as e:
    print(f"Error converting audio: {e}")
    raise

# Define the path to the static folder
static_folder = os.path.join(os.path.dirname(__file__), 'static')

# Ensure the static folder exists
if not os.path.exists(static_folder):
    os.makedirs(static_folder)

# Save the audio to the static folder
audio_path = os.path.join(static_folder, '1.mp3')
try:
    audio_segment.export(audio_path, format="mp3")
    print(f"Audio file saved to {audio_path}")
except Exception as e:
    print(f"Error saving audio file: {e}")
    raise
