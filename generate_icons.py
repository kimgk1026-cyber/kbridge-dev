"""
K-Bridge PWA 아이콘 생성기
실행: python generate_icons.py
결과: frontend/public/icons/ 폴더에 PNG 파일 생성
필요: pip install Pillow
"""
from PIL import Image, ImageDraw
import os
 
SIZES  = [72, 96, 128, 144, 152, 192, 384, 512]
OUTDIR = "frontend/public/icons"
os.makedirs(OUTDIR, exist_ok=True)
 
# K-Bridge 색상
BG_TOP    = (7, 19, 54)      # #071336
BG_BOT    = (11, 31, 75)     # #0B1F4B
ACCENT    = (16, 185, 129)   # #10B981 (에메랄드 그린)
TEXT_COL  = (255, 255, 255)
 
def make_icon(size: int):
    img  = Image.new("RGB", (size, size))
    draw = ImageDraw.Draw(img)
 
    # 그라디언트 배경
    for y in range(size):
        t = y / size
        r = int(BG_TOP[0] + t * (BG_BOT[0] - BG_TOP[0]))
        g = int(BG_TOP[1] + t * (BG_BOT[1] - BG_TOP[1]))
        b = int(BG_TOP[2] + t * (BG_BOT[2] - BG_TOP[2]))
        draw.line([(0, y), (size, y)], fill=(r, g, b))
 
    # 외곽 원 (Accent)
    pad = size * 0.07
    lw  = max(2, size // 32)
    draw.ellipse([pad, pad, size - pad, size - pad], outline=ACCENT, width=lw)
 
    # 내부 작은 원 (반투명 느낌)
    pad2 = size * 0.18
    draw.ellipse([pad2, pad2, size - pad2, size - pad2],
                 outline=(*ACCENT, 80), width=max(1, lw // 2))
 
    # "K" 텍스트 (비트맵 폰트)
    from PIL import ImageFont
    fs = int(size * 0.42)
    try:
        font = ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", fs
        )
    except Exception:
        try:
            font = ImageFont.truetype("arial.ttf", fs)
        except Exception:
            font = ImageFont.load_default()
 
    bbox = draw.textbbox((0, 0), "K", font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (size - tw) // 2 - bbox[0]
    ty = (size - th) // 2 - bbox[1] - size // 30
 
    # 그림자
    draw.text((tx + lw, ty + lw), "K", font=font, fill=(0, 0, 0, 120))
    # 본문 (흰색)
    draw.text((tx, ty), "K", font=font, fill=TEXT_COL)
 
    path = os.path.join(OUTDIR, f"icon-{size}x{size}.png")
    img.save(path, "PNG")
    print(f"  ✅  {path}")
 
print("K-Bridge 아이콘 생성 중...")
for s in SIZES:
    make_icon(s)
 
# favicon.ico
fav = Image.new("RGB", (32, 32))
d   = ImageDraw.Draw(fav)
for y in range(32):
    t = y / 32
    d.line([(0, y), (32, y)], fill=(
        int(BG_TOP[0] + t * 4), int(BG_TOP[1] + t * 4), int(BG_TOP[2] + t * 8)
    ))
d.ellipse([2, 2, 30, 30], outline=ACCENT, width=2)
fav.save("frontend/public/favicon.ico", "ICO")
print("  ✅  frontend/public/favicon.ico")
print("\n🎉 완료! icons 폴더에 아이콘이 생성되었습니다.")