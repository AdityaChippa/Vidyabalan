import os
from dotenv import load_dotenv

load_dotenv()

COST_PER_1K_TOKENS = float(os.getenv("COST_PER_1K_TOKENS", "0.0000059"))
INR_PER_USD = 83.0

def calculate_cost_usd(tokens: int) -> float:
    return (tokens / 1000.0) * COST_PER_1K_TOKENS

def calculate_cost_inr(tokens: int) -> float:
    return calculate_cost_usd(tokens) * INR_PER_USD

def calculate_savings_inr(tokens_used: int, tokens_baseline: int) -> float:
    return calculate_cost_inr(tokens_baseline) - calculate_cost_inr(tokens_used)
