import torch
import threading

_lock = threading.Lock()
active_audio_buffers: dict[str, torch.Tensor] = {}

MAX_SAMPLES = 16000 * 4

def update_buffer(call_id: str, new_tensor: torch.Tensor):
    with _lock:
        # Ensure we're dealing with a 1D tensor
        new_tensor = new_tensor.squeeze()
        if call_id not in active_audio_buffers:
            active_audio_buffers[call_id] = new_tensor
        else:
            combined = torch.cat((active_audio_buffers[call_id], new_tensor))
            if combined.shape[0] > MAX_SAMPLES:
                combined = combined[-MAX_SAMPLES:]
            active_audio_buffers[call_id] = combined

def get_buffer(call_id: str) -> torch.Tensor | None:
    with _lock:
        return active_audio_buffers.get(call_id)
