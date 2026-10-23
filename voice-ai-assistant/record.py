import sounddevice as sd
from scipy.io.wavfile import write

def record_audio():
    fs = 16000          # ✅ FIXED (important)
    seconds = 5
    device_id = 1       # ✅ your mic

    print("Speak now...")

    audio = sd.rec(
        int(seconds * fs),
        samplerate=fs,
        channels=1,
        dtype='int16',   # ✅ FIXED (important)
        device=device_id
    )

    sd.wait()

    write("input.wav", fs, audio)
    print("Recording saved!")