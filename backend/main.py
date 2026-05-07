import os
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ILMU_API_KEY = os.getenv("ILMU_API_KEY", "")
ILMU_API_BASE = os.getenv("ILMU_API_BASE", "https://api.ilmu-ai.my/v1")
ILMU_MODEL = os.getenv("ILMU_MODEL", "ilmu-1")

SYSTEM_PROMPT = """You are Orion's AI financial assistant with an Asian Parent personality.
You care deeply about the user's financial wellbeing, like a strict but loving parent who hates wasteful spending.
You are direct, slightly naggy, but always warm and want the best for the user.
You speak in a mix of relatable, mildly scolding yet encouraging tone.
Keep all responses concise and practical. Never use harsh or hurtful language."""

NOTICE_SYSTEM_PROMPT = """You are an Asian Parent financial assistant for a money app.
Based on the user's recent financial activity, generate ONE short sentence (max 12 words) as a nudge or comment.
Be like a concerned Asian parent — direct, slightly naggy, but caring. No emojis. No quotation marks. Just the sentence."""


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


async def call_ilmu(messages: list[dict]) -> str:
    headers = {
        "Authorization": f"Bearer {ILMU_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": ILMU_MODEL,
        "messages": messages,
        "max_tokens": 300,
        "temperature": 0.7,
    }
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(f"{ILMU_API_BASE}/chat/completions", headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/notice")
async def get_notice(req: NoticeRequest):
    user_msg = (
        f"Recent activity: {req.recent_activity}. "
        f"Daily spending limit: RM {req.daily_limit:.2f}. "
        f"Total spent today: RM {req.total_spent_today:.2f}."
    )
    messages = [
        {"role": "system", "content": NOTICE_SYSTEM_PROMPT},
        {"role": "user", "content": user_msg},
    ]
    try:
        sentence = await call_ilmu(messages)
        return {"notice": sentence}
    except Exception as e:
        return {"notice": "Eh, remember to spend wisely today!", "error": str(e)}


@app.post("/chat")
async def chat(req: ChatRequest):
    system = SYSTEM_PROMPT
    if req.context:
        system += f"\n\nUser's financial context: {req.context}"

    messages = [{"role": "system", "content": system}]
    for m in req.messages:
        messages.append({"role": m.role, "content": m.content})

    try:
        reply = await call_ilmu(messages)
        return {"reply": reply}
    except Exception as e:
        return {"reply": "Aiyah, something went wrong. Try again lah!", "error": str(e)}
