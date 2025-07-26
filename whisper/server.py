from fastapi import FastAPI, UploadFile
import whisper
import os

app = FastAPI()
model_name = "base"
model = whisper.load_model(model_name)


@app.get("/health")
def health_check():
    return {"status": "ok", "model": model_name}


@app.post("/transcribe")
async def transcribe(file: UploadFile):
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    result = model.transcribe(file_path)
    os.remove(file_path)
    return {"language": result["language"], "text": result["text"]}
