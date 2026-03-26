import os, time
from groq import Groq

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
PRIMARY = "llama-3.3-70b-versatile"
FALLBACK = "llama-3.1-8b-instant"
_client = None

def get_client():
    global _client
    if _client is None:
        _client = Groq(api_key=GROQ_API_KEY)
    return _client

def chat_completion_sync(system, user, max_tokens=1000):
    c = get_client()
    for model in [PRIMARY, FALLBACK]:
        try:
            r = c.chat.completions.create(
                model=model,
                messages=[{"role":"system","content":system},{"role":"user","content":user}],
                max_tokens=max_tokens, temperature=0.3
            )
            return r.choices[0].message.content
        except Exception as e:
            err = str(e).lower()
            if "rate" in err or "429" in err or "413" in err or "limit" in err:
                print(f"[GROQ] {model} rate limited, trying next...")
                time.sleep(2)
                continue
            raise
    print("[GROQ] All models limited, waiting 30s...")
    time.sleep(30)
    try:
        r = c.chat.completions.create(
            model=FALLBACK,
            messages=[{"role":"system","content":system},{"role":"user","content":user}],
            max_tokens=max_tokens, temperature=0.3
        )
        return r.choices[0].message.content
    except:
        return ""

def stream_chat(system, user, max_tokens=1000):
    c = get_client()
    for model in [PRIMARY, FALLBACK]:
        try:
            stream = c.chat.completions.create(
                model=model,
                messages=[{"role":"system","content":system},{"role":"user","content":user}],
                max_tokens=max_tokens, temperature=0.3, stream=True
            )
            for chunk in stream:
                d = chunk.choices[0].delta
                if d and d.content:
                    yield d.content
            return
        except Exception as e:
            err = str(e).lower()
            if "rate" in err or "429" in err or "413" in err or "limit" in err:
                print(f"[GROQ] {model} stream limited, falling back...")
                time.sleep(2)
                continue
            raise
    yield "Rate limited — please wait a minute and try again."
