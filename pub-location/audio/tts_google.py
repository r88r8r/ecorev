"""Regenerate the voice-over with Google Cloud Text-to-Speech.
Needs GOOGLE_TTS_API_KEY. Picks a female fr-FR voice of the chosen tier (default Neural2).
Usage: python3 audio/tts_google.py [Neural2|Wavenet|Chirp3-HD]"""
import base64, json, os, sys, urllib.request
KEY = os.environ["GOOGLE_TTS_API_KEY"]; TIER = sys.argv[1] if len(sys.argv) > 1 else "Neural2"
API = "https://texttospeech.googleapis.com/v1/"
def call(path, body=None):
    req = urllib.request.Request(API + path + ("&" if "?" in path else "?") + "key=" + KEY,
        data=json.dumps(body).encode() if body else None, headers={"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req))
voices = [v["name"] for v in call("voices?languageCode=fr-FR")["voices"] if TIER in v["name"] and v["ssmlGender"] == "FEMALE"]
voice = sorted(voices)[0]; print("voice:", voice)
LINES = open(os.path.join(os.path.dirname(__file__), "script.txt"), encoding="utf-8").read().strip().splitlines()
for i, line in enumerate(LINES, 1):
    inp = {"text": line} if TIER.startswith("Chirp") else {"ssml": "<speak>" + line + "</speak>"}
    r = call("text:synthesize", {"input": inp, "voice": {"languageCode": "fr-FR", "name": voice},
        "audioConfig": {"audioEncoding": "LINEAR16", "sampleRateHertz": 48000, "speakingRate": 1.05}})
    open(os.path.join(os.path.dirname(__file__), f"vo{i}.wav"), "wb").write(base64.b64decode(r["audioContent"]))
    print(f"vo{i}.wav ok")
