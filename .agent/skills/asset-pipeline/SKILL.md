---
name: asset-pipeline
description: "Handles importing AI-generated building assets into the Ultraviolet Perigee town module. Use this skill when the user provides raw images (e.g., from Midjourney, DALL-E) of buildings and wants them processed (background removal, cropping, resizing) into usable game sprites for the isometric town."
---

# Asset Pipeline Skill

This skill automates the workflow for converting raw AI-generated building images into production-ready game sprites for the town module.

## Workflow 

The automated script handles 5 steps:
1. **Background Removal**: Uses `rembg` to remove backgrounds from raw images.
2. **Auto-crop**: Uses Pillow to trim transparent padding down to a tight 16px margin.
3. **Resize**: Consistently scales the bounding box to exactly 512x512 using Nearest-Neighbor to preserve pixelated/voxel style.
4. **Copy Output**: Saves the final processed `.png` files into `public/assets/buildings/`.
5. **Sprite Manifest**: Automatically generates `src/modules/town/data/building-sprites.ts` to map habit types and levels to their corresponding sprite asset paths.

## Usage

When the user asks to process new building assets, follow these steps:

1. **Ensure the images are named correctly** in `assets/raw/`: 
   * The naming convention should be `[habit_type]-lv[level]`.
   * Examples: `meditation-lv1.png`, `gym-lv2.jpg`.
2. **Run the processor script**:
   ```bash
   python .agent/skills/asset-pipeline/scripts/process-assets.py --input assets/raw/ --output public/assets/buildings/
   ```
   *(If `rembg` or `Pillow` are missing, install them: `pip install rembg pillow --break-system-packages`)*
3. **Verify the Output**: Check `public/assets/buildings/` and `src/modules/town/data/building-sprites.ts`.

Afterward, the town building renderer can use these mapped sprites directly.
