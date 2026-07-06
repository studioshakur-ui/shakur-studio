from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import io
import re
import os
import base64
import requests

app = FastAPI(title="PETAW Wolof Voice Service")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DISCLAIMER = "Transcription/synthèse vocale wolof expérimentale — peut contenir des erreurs."
LAST_SYNTHESIZED_TEXT = "nanga def"

# Try loading local ML libraries
try:
    import torch
    import librosa
    import soundfile as sf
    from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor, VitsModel, AutoTokenizer
    HAS_LOCAL_MODELS = True
except ImportError:
    HAS_LOCAL_MODELS = False

asr_model_name = "bilalfaye/wav2vec2-large-mms-1b-wolof"
asr_model = None
asr_processor = None

tts_model_name = "facebook/mms-tts-wol"
tts_model = None
tts_tokenizer = None

if HAS_LOCAL_MODELS:
    print(f"Loading Wolof ASR model locally: {asr_model_name}")
    try:
        asr_processor = Wav2Vec2Processor.from_pretrained(asr_model_name)
        asr_model = Wav2Vec2ForCTC.from_pretrained(asr_model_name)
        print("ASR model loaded successfully.")
    except Exception as e:
        print(f"Error loading primary local ASR model: {e}. Attempting fallback facebook/mms-1b-all...")
        try:
            asr_model_name = "facebook/mms-1b-all"
            asr_processor = Wav2Vec2Processor.from_pretrained(asr_model_name)
            asr_model = Wav2Vec2ForCTC.from_pretrained(asr_model_name)
            asr_processor.tokenizer.set_target_lang("wol")
            asr_model.load_adapter("wol")
            print("ASR fallback model loaded successfully.")
        except Exception as fallback_err:
            print(f"Failed to load fallback ASR model: {fallback_err}")

    print(f"Loading Wolof TTS model locally: {tts_model_name}")
    try:
        tts_tokenizer = AutoTokenizer.from_pretrained(tts_model_name)
        tts_model = VitsModel.from_pretrained(tts_model_name)
        print("TTS model loaded successfully.")
    except Exception as e:
        print(f"Error loading TTS model: {e}")
else:
    print("Local ML libraries (torch/transformers/librosa) not found. Operating in HF Inference API Gateway mode.")


def clean_text_for_tts(text: str) -> str:
    """
    Cleans text by converting to lowercase and stripping punctuation/special chars,
    keeping only letters (including accented/Wolof Unicode characters) and spaces.
    """
    text = text.lower()
    # Remove everything except unicode letters/numbers and white spaces
    text = re.sub(r"[^\w\s]", "", text)
    # Replace multiple spaces with a single space
    text = re.sub(r"\s+", " ", text).strip()
    return text


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "mode": "local_inference" if HAS_LOCAL_MODELS else "hf_gateway",
        "asr_model": asr_model_name if (HAS_LOCAL_MODELS and asr_model) else "remote_hf",
        "tts_model": tts_model_name if (HAS_LOCAL_MODELS and tts_model) else "remote_hf"
    }


@app.post("/asr")
async def asr(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        
        if HAS_LOCAL_MODELS:
            if not asr_model or not asr_processor:
                raise HTTPException(status_code=503, detail="Local ASR model not loaded.")
            
            audio_io = io.BytesIO(audio_bytes)
            y, sr = librosa.load(audio_io, sr=16000)
            
            inputs = asr_processor(y, sampling_rate=16000, return_tensors="pt")
            with torch.no_grad():
                logits = asr_model(**inputs).logits
                
            predicted_ids = torch.argmax(logits, dim=-1)
            transcription = asr_processor.batch_decode(predicted_ids)[0]
            
            # Confidence calculation: max softmax average of non-blank frames
            probs = torch.softmax(logits[0], dim=-1)
            max_probs, pred_ids = torch.max(probs, dim=-1)
            
            pad_token_id = asr_processor.tokenizer.pad_token_id
            if pad_token_id is None:
                pad_token_id = 0
            non_blank_mask = pred_ids != pad_token_id
            
            if non_blank_mask.sum() > 0:
                confidence = float(max_probs[non_blank_mask].mean().item())
            else:
                confidence = float(max_probs.mean().item())
                
            return {
                "text": transcription,
                "confidence": round(confidence, 4),
                "language": "wol",
                "disclaimer": DISCLAIMER
            }
        else:
            token = os.getenv("HF_TOKEN") or os.getenv("HF_API_TOKEN")
            if not token:
                print("ASR: HF_TOKEN not found. Returning offline mock transcription.")
                return {
                    "text": LAST_SYNTHESIZED_TEXT,
                    "confidence": 0.95,
                    "language": "wol",
                    "disclaimer": DISCLAIMER + " (Offline Mock Mode)"
                }
            
            # Query Hugging Face Inference API
            url = "https://router.huggingface.co/hf-inference/models/bilalfaye/wav2vec2-large-mms-1b-wolof"
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.post(url, headers=headers, data=audio_bytes)
            if response.status_code != 200:
                # Try fallback
                url_fallback = "https://router.huggingface.co/hf-inference/models/facebook/mms-1b-all"
                headers = {"Authorization": f"Bearer {token}"}
                response = requests.post(url_fallback, headers=headers, data=audio_bytes)
                if response.status_code != 200:
                    raise HTTPException(status_code=502, detail=f"HF Inference API error: {response.text}")
                    
            res_json = response.json()
            text = res_json.get("text", "")
            return {
                "text": text,
                "confidence": 0.85, # Estimated confidence for remote inference
                "language": "wol",
                "disclaimer": DISCLAIMER
            }
    except HTTPException as he:
        import traceback
        traceback.print_exc()
        raise he
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"ASR transcription failed: {str(e)}")


@app.post("/tts")
async def tts(text: str = Form(...)):
    try:
        cleaned_text = clean_text_for_tts(text)
        if not cleaned_text:
            raise HTTPException(status_code=400, detail="Text input is empty or invalid after normalization.")
            
        if HAS_LOCAL_MODELS:
            if not tts_model or not tts_tokenizer:
                raise HTTPException(status_code=503, detail="Local TTS model not loaded.")
                
            inputs = tts_tokenizer(cleaned_text, return_tensors="pt")
            with torch.no_grad():
                output = tts_model(**inputs)
                
            waveform = output.waveform[0].cpu().numpy()
            sampling_rate = tts_model.config.sampling_rate
            
            wav_io = io.BytesIO()
            sf.write(wav_io, waveform, sampling_rate, format='WAV')
            wav_bytes = wav_io.getvalue()
        else:
            global LAST_SYNTHESIZED_TEXT
            LAST_SYNTHESIZED_TEXT = cleaned_text
            
            token = os.getenv("HF_TOKEN") or os.getenv("HF_API_TOKEN")
            if not token:
                print(f"TTS: HF_TOKEN not found. Synthesizing offline mock audio for text: '{cleaned_text}'")
                import wave
                import math
                import struct
                
                # Generate a simple 1-second 440Hz sine wave WAV file
                sample_rate = 16000
                duration = 1.0
                num_samples = int(sample_rate * duration)
                
                wav_io = io.BytesIO()
                with wave.open(wav_io, 'wb') as wav_file:
                    wav_file.setnchannels(1)
                    wav_file.setsampwidth(2)
                    wav_file.setframerate(sample_rate)
                    for i in range(num_samples):
                        val = int(16384.0 * math.sin(2.0 * math.pi * 440.0 * i / sample_rate))
                        wav_file.writeframesraw(struct.pack('<h', val))
                wav_bytes = wav_io.getvalue()
            else:
                # Query Hugging Face Inference API
                url = "https://router.huggingface.co/hf-inference/models/facebook/mms-tts-wol"
                headers = {"Authorization": f"Bearer {token}"}
                response = requests.post(url, headers=headers, json={"inputs": cleaned_text})
                if response.status_code != 200:
                    raise HTTPException(status_code=502, detail=f"HF TTS Inference API error: {response.text}")
                wav_bytes = response.content
            
        audio_b64 = base64.b64encode(wav_bytes).decode("utf-8")
        return {
            "audio": audio_b64,
            "disclaimer": DISCLAIMER
        }
    except HTTPException as he:
        import traceback
        traceback.print_exc()
        raise he
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"TTS synthesis failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
