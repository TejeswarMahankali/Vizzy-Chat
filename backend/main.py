from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from urllib.parse import quote
import os

from groq_service import ask_groq, stream_groq
from vision_service import analyze_image

# ============================================
# FastAPI App
# ============================================

app = FastAPI()

# ============================================
# CORS
# ============================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# Upload Folder
# ============================================

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

LAST_UPLOADED_IMAGE = None

# ============================================
# Request Models
# ============================================

class ChatRequest(BaseModel):
    message: str


class ImageRequest(BaseModel):
    prompt: str


class VisionRequest(BaseModel):
    prompt: str


# ============================================
# Home
# ============================================

@app.get("/")
def home():
    return {
        "message": "🚀 Vizzy Chat Backend Running"
    }


# ============================================
# Upload Image
# ============================================



# ============================================
# Vision AI
# ============================================

@app.post("/analyze-image")
async def analyze_uploaded_image(
    image: UploadFile = File(...),
    prompt: str = Form(...)
):

    file_path = os.path.join(
        UPLOAD_FOLDER,
        image.filename
    )

    with open(file_path, "wb") as buffer:
        buffer.write(await image.read())

    print("\n========== IMAGE RECEIVED ==========")
    print("Image :", image.filename)
    print("Prompt:", prompt)
    print("====================================")

    answer = analyze_image(
        file_path,
        prompt
    )

    return {
        "response": answer
    }

# ============================================
# Normal Chat
# ============================================

@app.post("/chat")
def chat(request: ChatRequest):

    response = ask_groq(request.message)

    return {
        "response": response
    }


# ============================================
# Streaming Chat
# ============================================

@app.post("/chat-stream")
def chat_stream(request: ChatRequest):

    return StreamingResponse(
        stream_groq(request.message),
        media_type="text/plain"
    )


# ============================================
# Image Generation
# ============================================

@app.post("/generate-image")
def generate_image(request: ImageRequest):

    prompt = quote(request.prompt)

    image_url = (
        f"https://image.pollinations.ai/prompt/{prompt}"
    )

    return {
        "image_url": image_url
    }