"""
process_assets.py
=================
Post-generation asset pipeline for Ultraviolet Perigee zone art.

TWO MODES:

─── MODE A: winners.json (PREFERRED for themed generation) ──────────────────
  python scripts/process_assets.py --winners-json scripts/winners.json

  Reads a winners.json file exported by preview_tool.html.
  Each entry maps a theme key → { ground, building } image paths.
  Output:
    public/assets/zones/<zone_short>/<theme_slug>/ground.png
    public/assets/zones/<zone_short>/<theme_slug>/building.png
  Manifest: src/modules/town/data/asset-manifest.ts

─── MODE B: directory scan (original, for level-based sprites) ──────────────
  python scripts/process_assets.py --input scripts/winners
  python scripts/process_assets.py --dry-run

  Expected input file naming:
    <zone>/<category>/<asset_name>.png
    e.g.  zen_zone/buildings/meditation_temple_l1.png

Pipeline for both modes:
1. Run rembg background removal (guards against faint AI gradients)
2. Crop to content bounding box with padding
3. Resize:
     buildings → 512×512 px, nearest-neighbour
     decorations → 256×256 px, nearest-neighbour
     grounds → unchanged resolution, Lanczos
4. Save to public/assets/zones/
5. Generate TypeScript manifest
"""

import os
import sys
import glob
import json
import shutil
import argparse
import subprocess
from pathlib import Path
from typing import Literal

try:
    from PIL import Image
except ImportError:
    print("[ERROR] Pillow not found. Install: pip install Pillow")
    sys.exit(1)

# ── Config ───────────────────────────────────────────────────────────────────
REMBG_EXE = r"C:\Users\erenk\AppData\Roaming\Python\Python314\Scripts\rembg.exe"

# Final output sizes
BUILDING_SIZE    = 512
DECORATION_SIZE  = 256
BUILDING_MARGIN  = 20    # px padding inside the final canvas
DECORATION_MARGIN = 12

# Zone → short name mapping (for public/ path)
ZONE_SHORT = {
    "zen_zone":     "zen",
    "fitness_zone": "fitness",
    "wellness_zone": "wellness",
    "knowledge_zone": "knowledge",
}

# Category directory → category key used in manifest
CATEGORY_KEYS = {"buildings", "decorations", "ground"}


# ── rembg ────────────────────────────────────────────────────────────────────
def run_rembg(input_path: Path, output_path: Path) -> bool:
    exe = REMBG_EXE if os.path.exists(REMBG_EXE) else "rembg"
    print(f"  rembg  ← {input_path.name}")
    try:
        subprocess.run(
            [exe, "i", str(input_path), str(output_path)],
            check=True,
            capture_output=True,
        )
        return True
    except subprocess.CalledProcessError as e:
        print(f"  [warn] rembg failed for {input_path.name}: {e.stderr.decode()[:200]}")
        return False
    except FileNotFoundError:
        print("[ERROR] rembg CLI not found. Install:  pip install rembg")
        sys.exit(1)


# ── Image processing ─────────────────────────────────────────────────────────
def process_building_or_deco(
    img_path: Path,
    target_size: int,
    margin: int,
    resample: int,          # Image.NEAREST or Image.LANCZOS
) -> Image.Image | None:
    try:
        with Image.open(img_path) as img:
            img = img.convert("RGBA")
            bbox = img.getbbox()
            if not bbox:
                print(f"  [warn] {img_path.name} is fully transparent — skipping")
                return None

            cropped = img.crop(bbox)

            max_inner = target_size - 2 * margin
            ow, oh = cropped.size
            scale = min(max_inner / ow, max_inner / oh)
            new_w = max(1, int(ow * scale))
            new_h = max(1, int(oh * scale))

            resized = cropped.resize((new_w, new_h), resample)

            canvas = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))
            off_x = (target_size - new_w) // 2
            off_y = target_size - new_h - margin   # bottom-align for isometric buildings
            canvas.paste(resized, (off_x, off_y), resized)
            return canvas
    except Exception as e:
        print(f"  [error] Processing {img_path.name}: {e}")
        return None


def process_ground(img_path: Path, padding_pct: float = 0.05) -> Image.Image | None:
    """Ground plates: crop to content + small padding, Lanczos (no resize)."""
    try:
        with Image.open(img_path) as img:
            img = img.convert("RGBA")
            bbox = img.getbbox()
            if not bbox:
                return None
            l, u, r, b = bbox
            pad_x = int((r - l) * padding_pct)
            pad_y = int((b - u) * padding_pct)
            l2 = max(0, l - pad_x)
            u2 = max(0, u - pad_y)
            r2 = min(img.width,  r + pad_x)
            b2 = min(img.height, b + pad_y)
            return img.crop((l2, u2, r2, b2)).copy()
    except Exception as e:
        print(f"  [error] Ground processing {img_path.name}: {e}")
        return None


# ── Manifest generation ──────────────────────────────────────────────────────
def build_manifest(registry: dict, manifest_path: Path):
    """
    registry: {zone_short: {category: {asset_name: public_path}}}
    Writes a TypeScript file exporting ZONE_ASSETS.
    """
    manifest_path.parent.mkdir(parents=True, exist_ok=True)

    lines = [
        "// AUTO-GENERATED — do not edit directly.",
        "// Re-run scripts/process_assets.py to regenerate.",
        "",
        "export interface ZoneAssets {",
        "  ground?: string;",
        "  buildings: Record<string, string>;",
        "  decorations: Record<string, string>;",
        "}",
        "",
        "export const ZONE_ASSETS: Record<string, ZoneAssets> = {",
    ]

    for zone_short, categories in sorted(registry.items()):
        lines.append(f"  {zone_short}: {{")

        if "ground" in categories:
            ground_path = list(categories["ground"].values())[0] if categories["ground"] else None
            if ground_path:
                lines.append(f"    ground: '{ground_path}',")

        # buildings
        lines.append("    buildings: {")
        for name, path in sorted(categories.get("buildings", {}).items()):
            lines.append(f"      '{name}': '{path}',")
        lines.append("    },")

        # decorations
        lines.append("    decorations: {")
        for name, path in sorted(categories.get("decorations", {}).items()):
            lines.append(f"      '{name}': '{path}',")
        lines.append("    },")

        lines.append("  },")

    lines += ["};", ""]
    manifest_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"\n  TypeScript manifest → {manifest_path}")


# ── Main pipeline ────────────────────────────────────────────────────────────
def detect_category_from_path(rel_path: Path) -> tuple[str, str, str] | None:
    """
    Try to infer (zone_key, category, asset_name) from a relative path like:
      zen_zone/buildings/meditation_temple_l1.png
    or from a flat filename:
      zen_zone-buildings-meditation_temple_l1.png
    Returns None if unparseable.
    """
    parts = list(rel_path.parts)

    # Nested structure: zone/category/name.png
    if len(parts) == 3:
        zone_raw, cat, fname = parts
        stem = Path(fname).stem
        if cat in CATEGORY_KEYS and zone_raw in ZONE_SHORT:
            return zone_raw, cat, stem

    # Flat with dashes: zone-category-name.png
    if len(parts) == 1:
        stem = Path(parts[0]).stem
        for z in ZONE_SHORT:
            prefix = f"{z}-"
            if stem.startswith(prefix):
                rest = stem[len(prefix):]
                for cat in CATEGORY_KEYS:
                    if rest.startswith(f"{cat}-") or rest.startswith(f"{cat}_"):
                        name = rest[len(cat)+1:]
                        return z, cat, name

    return None


def process_themed_winners(
    winners_json: Path,
    output_dir: Path,
    temp_dir: Path,
    manifest_p: Path,
    dry_run: bool = False,
    skip_rembg: bool = False,
):
    """
    Process winners selected via preview_tool.html.
    winners.json format:
      { "zen_zone/theme_01_japanese_garden": {
          "zone": "zen_zone", "slug": "theme_01_japanese_garden",
          "ground": "generated_assets/zen_zone/.../ground_v1.png",
          "building": "generated_assets/zen_zone/.../building_v1.png"
        }, ... }
    Paths in winners.json are relative to the scripts/ directory.
    """
    scripts_dir = Path(__file__).parent
    repo_root   = scripts_dir.parent

    data = json.loads(winners_json.read_text(encoding="utf-8"))
    print(f"\nLoaded {len(data)} theme entries from {winners_json.name}")

    # manifest: { zone_short: { slug: { ground: url, building: url } } }
    themed_registry: dict = {}
    ok_count = fail_count = 0

    for key, entry in sorted(data.items()):
        zone_key  = entry.get("zone", "")
        slug      = entry.get("slug", "")
        label     = entry.get("label", key)
        zone_short = ZONE_SHORT.get(zone_key, zone_key)

        print(f"\n  ── {label} ({zone_short}/{slug})")

        assets = [
            ("ground",    entry.get("ground"),    "ground"),
            ("building",  entry.get("building"),  "buildings"),
        ]

        theme_reg: dict = {}

        for asset_key, rel_src, category in assets:
            if not rel_src:
                continue

            # Resolve path: paths in winners.json are relative to scripts/
            src_path = (scripts_dir / rel_src).resolve()

            if not src_path.exists():
                print(f"    [missing] {rel_src}")
                fail_count += 1
                continue

            out_name  = f"{asset_key}.png"            # ground.png or building.png
            pub_subpath = f"/assets/zones/{zone_short}/{slug}/{out_name}"
            out_final = output_dir / zone_short / slug / out_name

            print(f"    {asset_key}: {src_path.name}  →  {out_final.relative_to(repo_root)}")

            if dry_run:
                theme_reg[asset_key] = pub_subpath
                ok_count += 1
                continue

            # rembg
            if skip_rembg:
                rembg_out = src_path
            else:
                temp_dir.mkdir(parents=True, exist_ok=True)
                rembg_out = temp_dir / f"{zone_key}-{slug}-{asset_key}.png"
                if not rembg_out.exists():
                    ok_rembg = run_rembg(src_path, rembg_out)
                    if not ok_rembg:
                        rembg_out = src_path
                else:
                    print(f"       rembg cached: {rembg_out.name}")

            # Process
            final_img: Image.Image | None = None
            if asset_key == "building":
                final_img = process_building_or_deco(
                    rembg_out, BUILDING_SIZE, BUILDING_MARGIN, Image.NEAREST
                )
            else:  # ground
                final_img = process_ground(rembg_out)

            if final_img is None:
                print(f"       [fail] Could not process {asset_key}")
                fail_count += 1
                continue

            out_final.parent.mkdir(parents=True, exist_ok=True)
            final_img.save(str(out_final), "PNG")
            print(f"       saved: {out_final.relative_to(repo_root)}")

            theme_reg[asset_key] = pub_subpath
            ok_count += 1

        if theme_reg:
            themed_registry.setdefault(zone_short, {})[slug] = theme_reg

    # Generate TypeScript manifest
    if themed_registry and not dry_run:
        build_themed_manifest(themed_registry, manifest_p)

    print(f"\n{'─'*52}")
    print(f"  Themed pipeline complete.  OK: {ok_count}  Failed: {fail_count}")
    print(f"{'─'*52}\n")


def build_themed_manifest(registry: dict, manifest_path: Path):
    """
    registry: { zone_short: { slug: { 'ground': url, 'building': url } } }
    """
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "// AUTO-GENERATED by scripts/process_assets.py — do not edit directly.",
        "",
        "export interface ThemeAssets {",
        "  slug: string;",
        "  label: string;",
        "  ground?: string;",
        "  building?: string;",
        "}",
        "",
        "export interface ZoneThemes {",
        "  themes: Record<string, ThemeAssets>;",
        "}",
        "",
        "export const THEMED_ZONE_ASSETS: Record<string, ZoneThemes> = {",
    ]

    for zone_short, themes in sorted(registry.items()):
        lines.append(f"  {zone_short}: {{")
        lines.append("    themes: {")
        for slug, assets in sorted(themes.items()):
            label = slug.replace("_", " ").title()
            lines.append(f"      '{slug}': {{")
            lines.append(f"        slug: '{slug}',")
            lines.append(f"        label: '{label}',")
            if "ground" in assets:
                lines.append(f"        ground: '{assets['ground']}',")
            if "building" in assets:
                lines.append(f"        building: '{assets['building']}',")
            lines.append("      },")
        lines.append("    },")
        lines.append("  },")

    lines += ["};", ""]
    manifest_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"\n  TypeScript manifest → {manifest_path}")


def main():
    repo_root = Path(__file__).parent.parent

    parser = argparse.ArgumentParser(description="Process zone winner images into public assets.")
    parser.add_argument(
        "--winners-json",
        default=None,
        help="Path to winners.json from preview_tool.html (use themed pipeline).",
    )
    parser.add_argument(
        "--input",
        default=str(repo_root / "scripts" / "winners"),
        help="(Mode B) Directory containing selected winner images (nested or flat).",
    )
    parser.add_argument(
        "--output",
        default=str(repo_root / "public" / "assets" / "zones"),
        help="Output public assets root  (default: public/assets/zones)",
    )
    parser.add_argument(
        "--temp",
        default=str(repo_root / "scripts" / "_rembg_cache"),
        help="Temp directory for rembg output (cached between runs).",
    )
    parser.add_argument(
        "--manifest",
        default=str(repo_root / "src" / "modules" / "town" / "data" / "asset-manifest.ts"),
        help="TypeScript manifest output path.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be processed without writing any files.",
    )
    parser.add_argument(
        "--skip-rembg",
        action="store_true",
        help="Skip background removal (if images already have clean alpha).",
    )
    args = parser.parse_args()

    # ── Mode A: winners.json ────────────────────────────────────────────────
    if args.winners_json:
        wj = Path(args.winners_json)
        if not wj.exists():
            print(f"[ERROR] winners.json not found: {wj}")
            sys.exit(1)
        process_themed_winners(
            winners_json=wj,
            output_dir=Path(args.output),
            temp_dir=Path(args.temp),
            manifest_p=Path(args.manifest),
            dry_run=args.dry_run,
            skip_rembg=args.skip_rembg,
        )
        return

    # ── Mode B: directory scan ──────────────────────────────────────────────
    input_dir  = Path(args.input)
    output_dir = Path(args.output)
    temp_dir   = Path(args.temp)
    manifest_p = Path(args.manifest)

    if not input_dir.exists():
        print(f"[ERROR] Input directory does not exist: {input_dir}")
        print("        Create it and copy your selected winner images there.")
        sys.exit(1)

    # Collect all image files
    all_images: list[Path] = []
    for ext in ("*.png", "*.jpg", "*.jpeg", "*.webp"):
        all_images.extend(input_dir.rglob(ext))

    if not all_images:
        print(f"No images found in {input_dir}/")
        print("Copy your selected winner images (renamed without version suffix) into that folder.")
        sys.exit(0)

    print(f"\nFound {len(all_images)} image(s) to process.\n")

    registry: dict = {}   # zone_short → category → {name → public_path}
    failed: list[str] = []

    for img_path in sorted(all_images):
        rel = img_path.relative_to(input_dir)
        parsed = detect_category_from_path(rel)

        if parsed is None:
            print(f"  [skip] Cannot determine zone/category for: {rel} — rename to zone/category/name.png")
            continue

        zone_raw, category, stem = parsed
        zone_short = ZONE_SHORT.get(zone_raw, zone_raw)

        public_subpath = f"/assets/zones/{zone_short}/{category}/{stem}.png"
        out_final = output_dir / zone_short / category / f"{stem}.png"

        print(f"  → {zone_short}/{category}/{stem}")

        if args.dry_run:
            print(f"       would write: {out_final}")
            registry.setdefault(zone_short, {}).setdefault(category, {})[stem] = public_subpath
            continue

        # 1. rembg
        if args.skip_rembg:
            rembg_out = img_path
        else:
            temp_dir.mkdir(parents=True, exist_ok=True)
            rembg_out = temp_dir / f"{zone_raw}-{category}-{stem}.png"
            if not rembg_out.exists():
                ok = run_rembg(img_path, rembg_out)
                if not ok:
                    # Fall back to original
                    rembg_out = img_path
            else:
                print(f"       rembg cached: {rembg_out.name}")

        # 2. Crop + resize
        final_img: Image.Image | None = None

        if category == "buildings":
            final_img = process_building_or_deco(
                rembg_out, BUILDING_SIZE, BUILDING_MARGIN, Image.NEAREST
            )
        elif category == "decorations":
            final_img = process_building_or_deco(
                rembg_out, DECORATION_SIZE, DECORATION_MARGIN, Image.NEAREST
            )
        elif category == "ground":
            final_img = process_ground(rembg_out)

        if final_img is None:
            print(f"       [fail] Could not process {stem}")
            failed.append(str(rel))
            continue

        # 3. Save
        out_final.parent.mkdir(parents=True, exist_ok=True)
        final_img.save(str(out_final), "PNG")
        print(f"       saved: {out_final.relative_to(repo_root)}")

        # 4. Register in manifest dict
        registry.setdefault(zone_short, {}).setdefault(category, {})[stem] = public_subpath

    # 5. Manifest
    if registry and not args.dry_run:
        build_manifest(registry, manifest_p)

    print(f"\n{'─'*50}")
    print(f"  Pipeline complete.  Processed: {len(all_images) - len(failed)}  Failed: {len(failed)}")
    if failed:
        print("  Failed files:")
        for f in failed:
            print(f"    {f}")
    print(f"{'─'*50}\n")


if __name__ == "__main__":
    main()
