import glob
from app.models.acoustic import classify
import torchaudio

CLIPS_DIR = "tests/fixtures/adversarial_clips/"

def run_stress_test():
    """Run team-made adversarial clips (from free TTS tools) and accented
    speech samples through the Layer 1 classifier and print a results table.
    An honest bad number here beats a hidden one in front of judges."""
    results = []
    for path in sorted(glob.glob(CLIPS_DIR + "*.wav")):
        waveform, sr = torchaudio.load(path)
        score = classify(waveform.numpy())
        results.append((path, score))
        print(f"{path:60s}  risk_score={score}")
    return results

if __name__ == "__main__":
    run_stress_test()