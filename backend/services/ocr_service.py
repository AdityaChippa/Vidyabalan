"""
OCR Service — OCR.space API only.
Free key: https://ocr.space/ocrapi/freekey (500 calls/day)
"""
import fitz
import requests
import base64
import os
import time

OCR_SPACE_KEY = os.getenv("OCR_SPACE_KEY", "")


def text_is_readable(text: str) -> bool:
    if not text or len(text.strip()) < 20:
        return False
    readable = 0
    for c in text:
        cp = ord(c)
        if c.isspace() or c in '.,;:!?()-\'"/%@#&=+[]{}':
            readable += 1
        elif 0x0020 <= cp <= 0x007E:
            readable += 1
        elif 0x0900 <= cp <= 0x097F:
            readable += 1
    return (readable / max(1, len(text))) > 0.50


def check_needs_ocr(pdf_bytes: bytes) -> bool:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    check = min(5, len(doc))
    readable = sum(1 for i in range(check) if text_is_readable(doc[i].get_text("text").strip()))
    doc.close()
    needs = readable < check * 0.4
    print(f"[OCR] {readable}/{check} readable → {'needs OCR' if needs else 'clean text'}")
    return needs


def extract_text_direct(pdf_bytes: bytes) -> list:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = [{"page_number": i+1, "text": doc[i].get_text("text").strip()} for i in range(len(doc))]
    doc.close()
    return pages


def ocr_space_page(img_bytes: bytes, page_num: int) -> str:
    url = "https://api.ocr.space/parse/image"
    b64 = base64.b64encode(img_bytes).decode()
    payload = {
        "base64Image": f"data:image/png;base64,{b64}",
        "language": "eng",
        "isOverlayRequired": False,
        "detectOrientation": True,
        "scale": True,
        "OCREngine": 2,
    }
    headers = {"apikey": OCR_SPACE_KEY}
    try:
        resp = requests.post(url, data=payload, headers=headers, timeout=30)
        result = resp.json()
        if result.get("OCRExitCode") == 1:
            parsed = result.get("ParsedResults", [])
            if parsed:
                return parsed[0].get("ParsedText", "").strip()
        else:
            err = result.get("ErrorMessage", "Unknown")
            print(f"[OCR] Page {page_num} error: {err}")
    except Exception as e:
        print(f"[OCR] Page {page_num} request error: {e}")
    return ""


def extract_with_ocr_space(pdf_bytes: bytes, on_progress=None) -> list:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = []
    total = len(doc)
    for i in range(total):
        pix = doc[i].get_pixmap(dpi=200)
        img_bytes = pix.tobytes("png")
        text = ocr_space_page(img_bytes, i + 1)
        pages.append({"page_number": i + 1, "text": text})
        if on_progress:
            on_progress(i + 1, total)
        if (i + 1) % 10 == 0:
            print(f"[OCR] {i+1}/{total} pages done")
        time.sleep(1.1)
    doc.close()
    return pages


def extract_pages(pdf_bytes: bytes, on_progress=None) -> tuple:
    if not check_needs_ocr(pdf_bytes):
        print("[EXTRACT] Clean text → direct extraction")
        return extract_text_direct(pdf_bytes), "text"
    if not OCR_SPACE_KEY:
        print("[EXTRACT] ERROR: OCR_SPACE_KEY not set! Get key from https://ocr.space/ocrapi/freekey")
        return extract_text_direct(pdf_bytes), "text_fallback"
    print("[EXTRACT] OCR.space API extraction...")
    pages = extract_with_ocr_space(pdf_bytes, on_progress)
    good = sum(1 for p in pages if len(p["text"]) > 30)
    sample = pages[min(5, len(pages)-1)]["text"][:200] if pages else "EMPTY"
    print(f"[EXTRACT] Done: {good}/{len(pages)} pages. Sample: {repr(sample[:120])}")
    return pages, "ocr_space"


def is_text_pdf(pdf_bytes: bytes) -> bool:
    return not check_needs_ocr(pdf_bytes)


def get_total_pages(pdf_bytes: bytes) -> int:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    c = len(doc)
    doc.close()
    return c