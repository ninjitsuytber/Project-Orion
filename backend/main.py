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
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/openai"

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
        resp = await client.post(url, headers=headers, json=payload)
        logger.info("Gemini response status: %s", resp.status_code)
        if resp.status_code != 200:
            logger.error("Gemini error body: %s", resp.text)
            resp.raise_for_status()
        data = resp.json()

    try:
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError) as e:
        logger.error("Unexpected Gemini response format: %s", data)
        raise ValueError(f"Unexpected response format: {e}") from e


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
