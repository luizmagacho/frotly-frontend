from PIL import Image

input_path = '/Users/luizfernandomagacho/.gemini/antigravity/brain/880f46c3-3339-4f7f-8dec-f17300b95634/frotly_logo_minimal_1783945789148.jpg'
output_path = '/Users/luizfernandomagacho/Desktop/fleet-manager/frontend/app/icon.png'

img = Image.open(input_path).convert("RGBA")

# Crop the center to remove the white corner brackets
width, height = img.size
# Let's crop a box in the middle. The corners are near the edges.
left = int(width * 0.15)
top = int(height * 0.15)
right = int(width * 0.85)
bottom = int(height * 0.85)
img = img.crop((left, top, right, bottom))

datas = img.getdata()

newData = []
for item in datas:
    r, g, b, a = item
    lum = (r * 0.299 + g * 0.587 + b * 0.114)
    # The background is dark. Let's set a threshold.
    if lum < 50:
        newData.append((255, 255, 255, 0))
    else:
        # Smooth anti-aliasing edge
        alpha = int((lum - 50) * 255 / (255 - 50))
        alpha = max(0, min(255, alpha))
        if alpha < 50:
            newData.append((r, g, b, 0))
        else:
            newData.append((r, g, b, alpha))

img.putdata(newData)
# Resize back to something standard
img = img.resize((512, 512), Image.Resampling.LANCZOS)
img.save(output_path, "PNG")
