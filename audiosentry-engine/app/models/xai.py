import base64
import io
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from captum.attr import Saliency


def generate_heatmap(model, mel_spectrogram_tensor) -> str:
    saliency = Saliency(model)
    mel_spectrogram_tensor.requires_grad_()
    attribution = saliency.attribute(mel_spectrogram_tensor)

    fig = plt.figure(figsize=(6, 3))
    
    # Squeeze tensors to 2D for visualization and convert to numpy
    import numpy as np
    base_image = mel_spectrogram_tensor.detach().cpu().squeeze().numpy()
    attr_image = attribution.detach().cpu().squeeze().numpy()
    if base_image.ndim == 1:
        base_image = base_image[np.newaxis, :]
        attr_image = attr_image[np.newaxis, :]
    
    # Plot base tensor and overlay attribution
    plt.imshow(base_image, cmap="gray")
    plt.imshow(attr_image, cmap="inferno", alpha=0.55)
    
    plt.title("Saliency Heatmap")
    plt.xlabel("Time")
    plt.ylabel("Mel frequency bin")
    
    # Save to buffer
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight")
    plt.close(fig)
    
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode("utf-8")
    
    return "data:image/png;base64," + encoded
