from flask import Flask, request, jsonify
from elevenlabs import Voice, VoiceSettings
from elevenlabs.client import ElevenLabs
from pydub import AudioSegment
import io
import os
from pydub import AudioSegment


app = Flask(__name__)

client = ElevenLabs(
    api_key="sggggk_4486" "3793cf8052d8f817db3c86c6d0c217ecc3a302d1684f"
)

@app.route('/textspeech', methods=['POST'])
def textspeech():
    data = request.json
    print(data)
    text = data.get('text', '')
    voice = data.get('voice', 'female')
    vol1 = data.get('vol1', 0.1)
    vol2 = data.get('vol2', 0.05)
    vol3 = data.get('vol3', 0)
    speed = data.get('speed', 1)
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    if voice == 'davis':
        voice_id = 'pNInz6obpgDQGcFmaJgB'
    elif voice == 'jane':
        voice_id = 'EXAVITQu4vr4xnSDxMaL'
    elif voice == 'tony':
        voice_id = 'GBv7mTt0atIp3Br8iCZE'
    elif voice == 'sara':
        voice_id = 'jBpfuIE2acCO8z3wKNLl'
    elif voice == 'eric':
        voice_id = 'ErXwobaYiN019PkySvjV'
    elif voice == 'emma':
        voice_id = 'EXAVITQu4vr4xnSDxMaL'
    else:
        voice_id = 'TxGEqnHWrfWFTfGW9XjX'

    audio_generator = client.generate(
        text=text,
        voice=Voice(
            voice_id=voice_id,
            settings=VoiceSettings(stability=0.71, similarity_boost=0.5, style=0.0, use_speaker_boost=True)
        )
    )

    # Convert the generator output to bytes
    audio_bytes = b''.join(chunk for chunk in audio_generator)

    # Convert audio to AudioSegment
    try:
        audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format="mp3")
    except Exception as e:
        print(f"Error converting audio: {e}")
        return jsonify({'error': 'Error converting audio'}), 500

    # Define the path to the static folder
    static_folder = os.path.join(os.path.dirname(__file__), 'static')

    # Ensure the static folder exists
    if not os.path.exists(static_folder):
        os.makedirs(static_folder)

    # Save the audio to the static folder
    audio_path = os.path.join(static_folder, '1.mp3')
    audio2_path = os.path.join(static_folder, '2.mp3')
    audio3_path = os.path.join(static_folder, '3.wav')
    audio_out_path = os.path.join(static_folder, 'out.mp3')
    try:
        audio_segment.export(audio_path, format="mp3")
    except Exception as e:
        print(f"Error exporting audio: {e}")
        return jsonify({'error': 'Error exporting audio'}), 500
    
    audio1 = AudioSegment.from_file(audio_path)
    audio2 = AudioSegment.from_file(audio2_path)
    audio3 = AudioSegment.from_file(audio3_path)

    # speed = speed*100

    if speed==0:
        print('normal')
    elif speed == 1:
        print("speed", 1.2)
        audio1 = audio1.speedup(playback_speed=1.2)
    elif speed == 2:
        print("speed", 1.5)
        audio1 = audio1.speedup(playback_speed=1.5)
    elif speed == 3:
        print("speed", 2)
        audio1 = audio1.speedup(playback_speed=2)
    elif speed == 4:
        print("speed", 2.5)
        audio1 = audio1.speedup(playback_speed=2.5)
    elif speed == 5:
        print("speed", 3)
        audio1 = audio1.speedup(playback_speed=3)
    elif speed == -1:
        print("speed", 0.8)
        return audio1.speedup(playback_speed=0.8)
    elif speed == -2:
        print("speed", 0.6)
        return audio1.speedup(playback_speed=0.6)
    elif speed == -3:
        print("speed", 0.5)
        return audio1.speedup(playback_speed=0.5)
    elif speed == -4:
        print("speed", 0.4)
        return audio1.speedup(playback_speed=0.4)
    elif speed == -5:
        print("speed", 0.3)
        return audio1.speedup(playback_speed=0.3)

    

    # Set volumes
    audio1 = audio1 + vol1 * 10  # Increase volume of the first audio by 0dB
    audio2 = audio2 + vol2 * 10  # Decrease volume of the second audio by 25dB
    audio3 = audio3 +vol3 * 10  # Increase volume of the third audio by 10dB

    # Combine the audio files by overlaying them
    combined = audio1.overlay(audio2).overlay(audio3)

    # combined.export("out.mp3", format="mp3")
    combined.export(audio_out_path, format="mp3")



    return jsonify({'audio_url': f'/static/out.mp3'}), 200

@app.route('/textsfx', methods=['POST'])
def textsfx():
    data = request.json
    print(data)
    text = data.get('text', '')
    time = data.get('time', '')
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    if time == 0:
        duration = 5
    elif time == 1:
        duration = 10
    elif time == 3:
        duration = 20
    else:
        duration = 3

    audio_generator = client.text_to_sound_effects.convert(
        text=text,
        duration_seconds=duration,  # Optional, if not provided will automatically determine the correct length
        prompt_influence=0.3,  # Optional, if not provided will use the default value of 0.3
    )

    # Convert the generator output to bytes
    audio_bytes = b''.join(chunk for chunk in audio_generator)

    # Convert audio to AudioSegment
    try:
        audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format="mp3")
    except Exception as e:
        print(f"Error converting audio: {e}")
        return jsonify({'error': 'Error converting audio'}), 500

    # Define the path to the static folder
    static_folder = os.path.join(os.path.dirname(__file__), 'static')

    # Ensure the static folder exists
    if not os.path.exists(static_folder):
        os.makedirs(static_folder)

    # Save the audio to the static folder

    audio_out_path = os.path.join(static_folder, 'sfx.mp3')
    try:
        audio_segment.export(audio_out_path, format="mp3")
    except Exception as e:
        print(f"Error exporting audio: {e}")
        return jsonify({'error': 'Error exporting audio'}), 500
    

    return jsonify({'audio_url': f'/static/sfx.mp3'}), 200

if __name__ == '__main__':
    app.run(debug=True)







# from flask import Flask, request, jsonify
# from elevenlabs import Voice, VoiceSettings
# from elevenlabs.client import ElevenLabs
# from pydub import AudioSegment
# import io
# import os

# app = Flask(__name__)

# client = ElevenLabs(
#     api_key="sk_44863793cf8052d8f817db3c86c6d0c217ecc3a302d1684f"
# )

# @app.route('/textspeech', methods=['POST'])
# def textspeech():
#     data = request.json
#     text = data.get('text', '')

#     if not text:
#         return jsonify({'error': 'No text provided'}), 400
    
#     # male: pNInz6obpgDQGcFmaJgB
#     # female: EXAVITQu4vr4xnSDxMaL

#     audio_generator = client.generate(
#         text=text,
#         voice=Voice(
#             voice_id='EXAVITQu4vr4xnSDxMaL',
#             settings=VoiceSettings(stability=0.71, similarity_boost=0.5, style=0.0, use_speaker_boost=True)
#         )
#     )

#     # Convert the generator output to bytes
#     audio_bytes = b''.join(chunk for chunk in audio_generator)

#     # Convert audio to AudioSegment
#     try:
#         audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format="mp3")
#     except Exception as e:
#         print(f"Error converting audio: {e}")
#         return jsonify({'error': 'Error converting audio'}), 500

#     # Define the path to the static folder
#     static_folder = os.path.join(os.path.dirname(__file__), 'static')

#     # Ensure the static folder exists
#     if not os.path.exists(static_folder):
#         os.makedirs(static_folder)

#     # Save the audio to the static folder
#     audio_path = os.path.join(static_folder, '1.mp3')
#     try:
#         audio_segment.export(audio_path, format="mp3")
#     except Exception as e:
#         print(f"Error saving audio file: {e}")
#         return jsonify({'error': 'Error saving audio file'}), 500

#     # Return the URL to the audio file


#     audio1 = AudioSegment.from_file("1.mp3")
#     audio2 = AudioSegment.from_file("2.mp3")
#     audio3 = AudioSegment.from_file("3.wav")

#     # Set volumes
#     audio1 = audio1 + 0  # Increase volume of the first audio by 0dB
#     audio2 = audio2 + 5  # Decrease volume of the second audio by 25dB
#     audio3 = audio3 - 8  # Increase volume of the third audio by 10dB

#     # Combine the audio files by overlaying them
#     combined = audio1.overlay(audio2).overlay(audio3)

#     # Export the combined audio file
#     combined.export("out.mp3", format="mp3")
#     return jsonify({'audio_url': f'/static/out.mp3'})

# if __name__ == "__main__":
#     app.run(host='0.0.0.0', port=5000)







# from elevenlabs import Voice, VoiceSettings
# from elevenlabs.client import ElevenLabs
# from pydub import AudioSegment
# import io
# import os
# from flask import Flask

# app = Flask(__name__)

# client = ElevenLabs(
#     api_key="sk_44863793cf8052d8f817db3c86c6d0c217ecc3a302d1684f"
# )

# @app.route('/textspeech')
# def textspeech():
#     audio_generator = client.generate(
#         text="Hello! how are you. My name is Bella.",
#         voice=Voice(
#             voice_id='EXAVITQu4vr4xnSDxMaL',
#             settings=VoiceSettings(stability=0.71, similarity_boost=0.5, style=0.0, use_speaker_boost=True)
#         )
#     )

#     # Convert the generator output to bytes
#     audio_bytes = b''.join(chunk for chunk in audio_generator)

#     # Convert audio to AudioSegment
#     try:
#         audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format="mp3")
#     except Exception as e:
#         print(f"Error converting audio: {e}")
#         raise

#     # Define the path to the static folder
#     static_folder = os.path.join(os.path.dirname(__file__), 'static')

#     # Ensure the static folder exists
#     if not os.path.exists(static_folder):
#         os.makedirs(static_folder)

#     # Save the audio to the static folder
#     audio_path = os.path.join(static_folder, '1.mp3')
#     try:
#         audio_segment.export(audio_path, format="mp3")
#         print(f"Audio file saved to {audio_path}")
#     except Exception as e:
#         print(f"Error saving audio file: {e}")
#         raise

# if __name__ == "__main__":
#     # app.run(host='0.0.0.0', port=3000)
#     app.run()
