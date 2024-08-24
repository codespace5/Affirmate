# from pydub import AudioSegment

# # Load the audio files
# audio1 = AudioSegment.from_file("1.mp3")
# audio2 = AudioSegment.from_file("2.mp3")

# # Set volumes
# audio1 = audio1 + 0  # Increase volume of the first audio by 5dB
# audio2 = audio2 -25  # Increase volume of the second audio by 10dB

# # Combine the audio files
# # combined = audio1 + audio2
# combined = audio1.overlay(audio2)

# # Export the combined audio file
# combined.export("out.wav", format="wav")


from pydub import AudioSegment
import numpy as np
import scipy.signal

# Load the audio files
audio1 = AudioSegment.from_file("1.mp3")
audio2 = AudioSegment.from_file("2.mp3")
audio3 = AudioSegment.from_file("3.wav")

audio1 = audio1.speedup(playback_speed=0.8)
# time_stretch(audio1, 3)
# Set volumes
audio1 = audio1 + 0  # Increase volume of the first audio by 0dB
audio2 = audio2 + 5  # Decrease volume of the second audio by 25dB
audio3 = audio3 - 8  # Increase volume of the third audio by 10dB

# Combine the audio files by overlaying them
combined = audio1.overlay(audio2).overlay(audio3)

# Export the combined audio file
combined.export("out.mp3", format="mp3")