import os
import subprocess
from pathlib import Path

# Since this script is primarily intended for macOS users, we utilize the built-in `say` command
# as a free local TTS tool to synthesize different voices for testing.
# For higher-fidelity "deepfakes", you can replace this with `TTS` (Coqui) or install `pyttsx3`.

OUTPUT_DIR = Path(__file__).parent / "fixtures" / "adversarial_clips"

# 8-10 utterances for adversarial stress-testing (Layer 1 spoof classifier)
UTTERANCES = [
    ("Albert", "My voice is my password. Verify me."),
    ("Bad News", "Authentication required. Please grant access immediately."),
    ("Bells", "Transfer ten thousand dollars to the offshore account."),
    ("Boing", "I am the administrator. Override the security protocol."),
    ("Albert", "Testing the system's defenses with synthetic speech."),
    ("Bad News", "This is a recorded message to bypass the voice prompt."),
    ("Bells", "Can you hear me clearly? I am trying to login."),
    ("Boing", "System status check. Voice authentication initiated."),
    ("Albert", "Open the vault. Authorization code alpha zero one."),
    ("Bad News", "Reset the primary admin password now."),
]

def generate_clips():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Generating adversarial TTS clips in {OUTPUT_DIR}...")
    
    for i, (voice, text) in enumerate(UTTERANCES):
        filename = OUTPUT_DIR / f"adversarial_clip_{i:02d}_{voice.replace(' ', '_')}.wav"
        
        # We use LEI16@16000 to output a standard 16kHz 16-bit WAV file
        cmd = [
            "say",
            "-v", voice,
            text,
            "-o", str(filename),
            "--data-format=LEI16@16000"
        ]
        
        print(f"[{i+1}/{len(UTTERANCES)}] Generating {filename.name} using voice '{voice}'...")
        try:
            subprocess.run(cmd, check=True)
        except subprocess.CalledProcessError as e:
            print(f"Failed to generate {filename.name}: {e}")
        except FileNotFoundError:
            print("Error: The 'say' command is not available. Are you on macOS?")
            print("Consider swapping the subprocess call to use 'pyttsx3' or 'espeak' if on Linux/Windows.")
            break
            
    print("Generation complete!")

if __name__ == "__main__":
    generate_clips()
