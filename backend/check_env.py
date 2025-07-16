#!/usr/bin/env python
"""
Script to check if environment variables are loaded correctly
"""
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

print("=== Environment Variables Check ===")
print(f"BASE_DIR: {BASE_DIR}")
print(f".env file exists: {(BASE_DIR / '.env').exists()}")

# Check key environment variables
env_vars = [
    "BREVO_API_KEY",
    "EMAIL_HOST_USER", 
    "EMAIL_HOST_PASSWORD",
    "DEFAULT_FROM_EMAIL",
    "DJANGO_SECRET_KEY",
    "DEBUG"
]

for var in env_vars:
    value = os.getenv(var)
    if value:
        # Mask sensitive values
        if "KEY" in var or "PASSWORD" in var:
            masked_value = value[:8] + "..." if len(value) > 8 else "***"
            print(f"{var}: {masked_value}")
        else:
            print(f"{var}: {value}")
    else:
        print(f"{var}: NOT SET")

print("\n=== Brevo API Key Check ===")
brevo_key = os.getenv("BREVO_API_KEY")
if brevo_key and brevo_key != "your-brevo-api-key-here":
    print("✅ Brevo API key is set")
    print(f"Key starts with: {brevo_key[:10]}...")
else:
    print("❌ Brevo API key is not set or is default value")
    print("Please set BREVO_API_KEY in your .env file") 