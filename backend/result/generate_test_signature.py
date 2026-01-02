# generate_test_signature.py
from PIL import Image, ImageDraw, ImageFont
import os

def create_signature(text="John Smith", filename="test_signature.png"):
    # Create image with white background
    img = Image.new('RGB', (400, 150), 'white')
    draw = ImageDraw.Draw(img)
    
    # Try to use a cursive font, fallback to default
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except:
        font = ImageFont.load_default()
    
    # Draw signature text
    draw.text((50, 50), text, fill='black', font=font)
    
    # Draw a line under the signature
    draw.line([(30, 120), (370, 120)], fill='black', width=2)
    
    # Save
    img.save(filename)
    print(f"✅ Test signature saved as {filename}")

if __name__ == "__main__":
    create_signature("John Smith", "teacher_signature.png")