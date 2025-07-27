from fastapi import FastAPI, UploadFile, HTTPException, Body
import whisper
import os
import tempfile
import requests

app = FastAPI()

# Load model from environment variable or default to "base"
model_name = os.getenv("WHISPER_MODEL", "base")
print(f"Loading Whisper model: {model_name}")
model = whisper.load_model(model_name)


@app.get("/health")
def health_check():
    print("Health check called")
    return {"status": "ok", "model": model_name}


@app.post("/transcribe")
async def transcribe(file: UploadFile):
    try:
        if not file:
            raise HTTPException(status_code=400, detail="No file uploaded")

        # Save the uploaded file to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            temp_file_path = tmp.name
            file_bytes = await file.read()
            if not file_bytes:
                raise HTTPException(
                    status_code=400, detail="Uploaded file is empty")
            tmp.write(file_bytes)

        print(f"Transcribing file: {file.filename}")
        result = model.transcribe(temp_file_path)
        os.remove(temp_file_path)

        return {
            "language": result.get("language", "unknown"),
            "text": result.get("text", "")
        }

    except Exception as e:
        print(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/transcribe-url")
def transcribe_url(url: str = Body(..., embed=True)):
    """
    Transcribes audio from a given URL.
    Request body: { "url": "https://example.com/audio.wav" }
    """
    try:
        if not url:
            raise HTTPException(status_code=400, detail="URL is required")

        print(f"Downloading audio from: {url}")
        response = requests.get(url, stream=True)
        if response.status_code != 200:
            raise HTTPException(
                status_code=400, detail="Unable to download audio file")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            temp_file_path = tmp.name
            for chunk in response.iter_content(chunk_size=8192):
                tmp.write(chunk)

        print(f"Transcribing audio from URL: {url}")
        result = model.transcribe(temp_file_path)
        os.remove(temp_file_path)

        return {
            "language": result.get("language", "unknown"),
            "text": result.get("text", "")
        }

    except Exception as e:
        print(f"Transcription error (URL): {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect-language")
async def detect_language(file: UploadFile = None, url: str = Body(None)):
    """
    Detect language of an uploaded file or a remote audio file URL.
    - Upload file as form-data with key 'file'
    - OR pass JSON: { "url": "https://example.com/audio.wav" }
    """
    try:
        temp_file_path = None

        # Case 1: URL provided
        if url:
            print(f"Downloading audio for language detection: {url}")
            response = requests.get(url, stream=True)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=400, detail="Unable to download audio file")

            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
                temp_file_path = tmp.name
                for chunk in response.iter_content(chunk_size=8192):
                    tmp.write(chunk)

        # Case 2: File uploaded
        elif file:
            print(f"Uploaded file for language detection: {file.filename}")
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
                temp_file_path = tmp.name
                file_bytes = await file.read()
                if not file_bytes:
                    raise HTTPException(
                        status_code=400, detail="Uploaded file is empty")
                tmp.write(file_bytes)
        else:
            raise HTTPException(
                status_code=400, detail="No file or URL provided")

        # Detect language
        audio = whisper.load_audio(temp_file_path)
        audio = whisper.pad_or_trim(audio)
        mel = whisper.log_mel_spectrogram(audio).to(model.device)
        _, probs = model.detect_language(mel)
        detected_lang = max(probs, key=probs.get)

        os.remove(temp_file_path)
        return {"language": detected_lang, "confidence": probs[detected_lang]}

    except Exception as e:
        print(f"Language detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
