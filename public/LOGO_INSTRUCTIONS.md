# Logo Setup Instructions

## IMPORTANT: Logo File Required

To display the logo in generated PDF invoices, you **MUST** add your logo file to this `public` folder.

## Steps:

1. **Get your logo file** (PNG or JPG format recommended)
2. **Rename it to exactly:** `logo.png` or `logo.jpg`
3. **Place it in this folder:** `speedy-visakha-ship/public/`
4. **The file should be accessible at:** `/logo.png` or `/logo.jpg`

## Supported Formats:
- PNG (recommended)
- JPG/JPEG
- SVG (may have limitations)

## Recommended Size:
- Width: 200-400 pixels
- Height: 80-160 pixels
- Aspect ratio: 2.5:1 to 3:1 (wider than tall)

## Testing:
After adding the logo file:
1. Open browser console (F12)
2. Generate a PDF invoice
3. Look for: "✓ Logo successfully loaded and added"
4. If you see "⚠ Logo not found", check:
   - File name is exactly `logo.png` or `logo.jpg`
   - File is in the `public` folder
   - File is not corrupted

## Current Status:
**No logo file detected in public folder.**
Please add your logo file to enable logo display in PDF invoices.

