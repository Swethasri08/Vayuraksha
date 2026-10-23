from record import record_audio
from speech_to_text import convert_speech_to_text
from chat import get_response
from speak import speak

# Step 1: Record
record_audio()

# Step 2: Speech → Text
text = convert_speech_to_text("input.wav")
print("You:", text)

# Step 3: AI Response
response = get_response(text)
print("AI:", response)

# Step 4: Speak
speak(response)