import os
import httpx
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("orion-ai")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
GEMINI_MODEL = "gemini-3.1-flash-lite-preview"
GEMINI_FALLBACK_MODEL = "gemini-2.5-flash"
GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/openai"

MODELS_TO_TRY = ["gemini-3.1-flash-lite-preview", "gemini-2.5-flash","gemini-2.0-flash","gemini-2.5-flash-lite","gemini-2.0-flash-lite"]

SYSTEM_PROMPT = """\
You are Orion, a financial assistant with an Asian Parent personality.
You care deeply about the user's financial wellbeing — like a strict but loving parent who hates wasteful spending.
You are direct, occasionally naggy, but always warm and want the best for the user.
You teach and guide the user toward positive financial habits without being harsh or discouraging.
Speak naturally and conversationally. Keep responses concise (2-4 sentences max).
Use simple English. You may occasionally add "lah", "aiyah", or "wah" for character, but don't overdo it."""

NOTICE_SYSTEM_PROMPT = """\
You are an Asian Parent financial assistant for a money app.
Based on the user's recent financial activity, write ONE short sentence (max 12 words) as a nudge or comment.
Be like a concerned Asian parent — direct, slightly naggy, but warm and caring.
No emojis. No quotation marks. Output only the sentence, nothing else."""


class NoticeRequest(BaseModel):
    recent_activity: str
    daily_limit: float = 0
    total_spent_today: float = 0


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    context: str = ""


async def call_gemini(messages: list[dict], max_tokens: int = 200) -> str:
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY is not set")

    headers = {
        "Authorization": f"Bearer {GOOGLE_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GEMINI_MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.75,
    }

    url = f"{GEMINI_BASE}/chat/completions"
    logger.info("Calling Gemini: %s | model=%s | messages=%d", url, GEMINI_MODEL, len(messages))

    async with httpx.AsyncClient(timeout=25) as client:
        for model in MODELS_TO_TRY:
            payload = {
                "model": model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": 0.75,
            }
            
            logger.info("Attempting Gemini API | model=%s | messages=%d", model, len(messages))
            
            try:
                resp = await client.post(url, headers=headers, json=payload)
                
                # If successful, return the data immediately
                if resp.status_code == 200:
                    data = resp.json()
                    logger.info("Success with model: %s", model)
                    return data["choices"][0]["message"]["content"].strip()
                else:
                    # Log the specific error from this model, but don't crash yet
                    logger.warning("Model %s failed with status %s: %s", model, resp.status_code, resp.text)
            
            except httpx.RequestError as e:
                # Catch network errors (like timeouts)
                logger.warning("Network error with model %s: %s", model, str(e))
            except (KeyError, IndexError) as e:
                # Catch unexpected JSON formatting
                logger.warning("Unexpected response format from model %s: %s", model, str(e))

        # If the loop finishes and we are here, ALL models failed
        logger.error("All fallback models exhausted. API request failed.")
        raise RuntimeError("All Gemini models failed to respond correctly.")


@app.get("/health")
def health():
    return {"status": "ok", "model": GEMINI_MODEL}


@app.post("/notice")
async def get_notice(req: NoticeRequest):
    user_msg = (
        f"User financial activity: {req.recent_activity}. "
        f"Daily spending limit: RM {req.daily_limit:.2f}. "
        f"Total spent today: RM {req.total_spent_today:.2f}."
    )
    messages = [
        {"role": "system", "content": NOTICE_SYSTEM_PROMPT},
        {"role": "user", "content": user_msg},
    ]
    try:
        sentence = await call_gemini(messages, max_tokens=60)
        logger.info("Notice generated: %s", sentence)
        return {"notice": sentence}
    except Exception as e:
        logger.error("Notice generation failed: %s", e)
        return {"notice": "Eh, remember to spend wisely today!", "error": str(e)}


@app.post("/chat")
async def chat(req: ChatRequest):
    system = SYSTEM_PROMPT
    if req.context:
        system += f"\n\nUser's current financial snapshot: {req.context}"

    messages = [{"role": "system", "content": system}]
    for m in req.messages:
        messages.append({"role": m.role, "content": m.content})

    try:
        reply = await call_gemini(messages, max_tokens=300)
        logger.info("Chat reply generated (%d chars)", len(reply))
        return {"reply": reply}
    except Exception as e:
        logger.error("Chat generation failed: %s", e)
        return {"reply": "Aiyah, something went wrong. Try again lah!", "error": str(e)}
