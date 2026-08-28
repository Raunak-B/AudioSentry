import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Set up standard logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

try:
    # pyrefly: ignore [missing-import]
    from datasets import load_dataset, Audio
except ImportError:
    logger.error("The 'datasets' library is not installed. Please install it with 'pip install datasets'.")
    raise


def process_and_save_dataset(dataset_name: str, config_name: str, split: str, output_dir: Path, token: str):
    """
    Pulls a dataset from Hugging Face, standardizes the sample rate to 16kHz,
    and saves the processed dataset to disk.
    """
    try:
        logger.info(f"Downloading and loading dataset '{dataset_name}' (config: {config_name}, split: {split})...")
        
        # Pass the config_name as the second argument
        if config_name:
            dataset = load_dataset(dataset_name, config_name, split=split, token=token)
        else:
            dataset = load_dataset(dataset_name, split=split, token=token)
        
        # Check if the standard 'audio' column exists to cast its sampling rate
        if "audio" in dataset.column_names:
            logger.info(f"Standardizing audio sampling rate to 16kHz for '{dataset_name}'...")
            dataset = dataset.cast_column("audio", Audio(sampling_rate=16000))
        else:
            logger.warning(f"No 'audio' column found in dataset '{dataset_name}'. Available columns: {dataset.column_names}")

        # Construct save path and save the processed split
        save_path = output_dir / f"{dataset_name.replace('/', '_')}_{config_name}" / split
        save_path.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Saving processed dataset to '{save_path}'...")
        dataset.save_to_disk(str(save_path))
        logger.info(f"Successfully processed and saved '{dataset_name}'.")

    except Exception as e:
        logger.error(f"Failed to process dataset '{dataset_name}': {e}", exc_info=True)


def main():
    logger.info("Initializing dataset preparation script...")
    
    # Load HUGGINGFACE_TOKEN from .env for authentication
    env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(dotenv_path=env_path)
    
    hf_token = os.getenv("HUGGINGFACE_TOKEN")
    if not hf_token:
        logger.warning("HUGGINGFACE_TOKEN not found in the environment. Gated datasets will fail to download.")
    else:
        logger.info("Successfully loaded HUGGINGFACE_TOKEN.")

    # Define directories
    base_data_dir = Path(__file__).resolve().parent
    processed_dir = base_data_dir / "processed"
    processed_dir.mkdir(parents=True, exist_ok=True)

    # Datasets to pull and process as tuples: (dataset_name, config_name)
    datasets_to_process = [
        ("PolyAI/minds14", "en-US") 
    ]

    for ds_name, config_name in datasets_to_process:
        process_and_save_dataset(
            dataset_name=ds_name,
            config_name=config_name,
            split="train", 
            output_dir=processed_dir, 
            token=hf_token
        )

    logger.info("Dataset preparation finished.")


if __name__ == "__main__":
    main()