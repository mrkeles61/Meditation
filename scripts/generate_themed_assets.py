#!/usr/bin/env python3
"""
generate_themed_assets.py — Ultraviolet Perigee

Generates 18 themed zone art assets (9 Zen + 9 Fitness) × 3 images each = 54 total.

Per theme:
  ground_v1.png  — first ground plate variation  (16:9, 2K)
  ground_v2.png  — second ground plate variation (16:9, 2K)
  building_v1.png — single building image         (1:1,  2K)

Output: scripts/generated_assets/<zone>/<theme_slug>/
Resume-safe: skips files already present in themed_generation_log.json
"""

import os, sys, time, json, datetime
from pathlib import Path
from io import BytesIO

# ── load .env if GEMINI_API_KEY not set ──────────────────────────────────────
if not os.environ.get("GEMINI_API_KEY"):
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("VITE_GEMINI_API_KEY="):
                os.environ["GEMINI_API_KEY"] = line.split("=", 1)[1].strip()
                break

from PIL import Image
from google import genai
from google.genai import types

client = genai.Client()

# ── Config ───────────────────────────────────────────────────────────────────
OUT_DIR          = Path(__file__).parent / "generated_assets"
LOG_PATH         = OUT_DIR / "themed_generation_log.json"
DELAY_BETWEEN    = 3.0    # seconds between successful API calls
RETRY_DELAY_BASE = 30     # seconds base backoff on rate-limit
MAX_RETRIES      = 3

# ── Master style prefix (prepended to every prompt) ──────────────────────────
STYLE = (
    "Chunky voxel art style, bright saturated colors, isometric 3/4 top-down view "
    "at approximately 30-35 degrees from horizontal. Inspired by Stardew Valley, "
    "Animal Crossing, Pokemon, and Crossy Road aesthetics. Clean flat even lighting "
    "with no baked shadows. Crisp pixel-influenced edges on voxel shapes. "
    "The entire subject must be fully visible with generous padding on all sides "
    "— nothing cropped at any edge. "
)

_GROUND_SUFFIX = (
    "Large expansive zone with generous negative space and padding around the edges. "
    "No buildings or architectural structures on the ground plate — only terrain, "
    "paths, water features, plants, and environmental props. "
    "Pure clean background or transparent. Designed as a 16:9 ground plate for a mobile game level."
)

_BUILDING_SUFFIX = (
    "Single isolated building centered in the frame with generous padding on all sides. "
    "Entire building fully visible, no parts cropped at any edge. "
    "Pure transparent or clean white background. Square 1:1 format. "
    "Building should feel substantial, detailed, and architectural."
)


# ── Theme definitions ─────────────────────────────────────────────────────────
THEMES = [

    # ══════════════════════════════════════════════════════════════════
    #  ZEN ZONE  (9 themes)
    # ══════════════════════════════════════════════════════════════════

    {
        "zone":  "zen_zone",
        "slug":  "theme_01_japanese_garden",
        "label": "Traditional Japanese Garden",
        "ground": (
            "A vast serene traditional Japanese zen garden game zone. "
            "Raked sand in concentric ripple patterns around moss-covered stone groupings. "
            "A large koi pond with orange and white koi, lily pads, and an arched stone bridge. "
            "Cherry blossom trees in full pink bloom with petals drifting onto the paths. "
            "Bamboo fences lining the borders, ishidoro stone lanterns along winding stone paths. "
            "Three clearly visible flat stone-paved platform clearings where buildings will be placed. "
            "A vermillion torii gate at the main path entrance. Manicured cloud-pruned pine trees. "
            + _GROUND_SUFFIX
        ),
        "building": (
            "A magnificent five-tiered Japanese pagoda temple. "
            "Five sweeping curved teal-green tile roofs, each tier smaller than the one below. "
            "Gold ornamental finials at each roof corner and the apex. "
            "Red lacquered wooden columns, white plaster walls, shoji screen windows with warm amber glow. "
            "Stone lanterns flanking stone entrance steps. "
            "Cherry blossom branches gracefully framing the upper tiers. "
            "Timeless Japanese architectural grandeur. "
            + _BUILDING_SUFFIX
        ),
    },

    {
        "zone":  "zen_zone",
        "slug":  "theme_02_origami_world",
        "label": "Paper Craft Origami World",
        "ground": (
            "A whimsical game zone where everything is made of folded colored paper — paper craft art style. "
            "Flat geometric grass fields with visible paper crease lines. "
            "Angular paper-folded mountains as zone borders in pastel green and blue. "
            "A flat angular paper pond with lotus flowers folded from white and pink paper. "
            "Origami cranes perched on paper bamboo stalks. "
            "Zigzag paths made from strips of folded colored paper in cheerful pastels. "
            "Paper trees with geometric triangular canopies. "
            "Three flat cleared areas for buildings. Bright, artistic, whimsical. "
            + _GROUND_SUFFIX
        ),
        "building": (
            "An origami-style paper-craft temple building for a mobile game. "
            "Sharp angular geometry that looks made entirely of folded colored paper. "
            "Multi-layered roof in alternating pastel paper colors: cream, soft blue, pale gold, light pink. "
            "Clean sharp fold lines define every surface and edge. "
            "Triangular paper columns with visible crease patterns. "
            "A large white origami crane perched at the roof apex as a finial. "
            "Simple geometric arched doorway. Pristine, artistic, and fun. "
            + _BUILDING_SUFFIX
        ),
    },

    {
        "zone":  "zen_zone",
        "slug":  "theme_03_tree_of_life",
        "label": "Mystical Tree of Life",
        "ground": (
            "A magical game zone dominated by the enormous ancient roots of a colossal tree. "
            "Massive gnarled exposed tree roots spread across the ground creating natural paths and platforms. "
            "Glowing bioluminescent moss in teal and green lights the root surfaces. "
            "Hanging vines with tiny glowing seed pods. Magical sparkle particles float in the air. "
            "Wooden plank bridges span gaps between roots. Small glowing mushrooms cluster at root bases. "
            "Patches of soft green grass between roots. "
            "Three natural clearings among the roots where structures will be placed. "
            "Ancient, primordial, magical atmosphere. "
            + _GROUND_SUFFIX
        ),
        "building": (
            "An elven forest hall built around living tree trunks for a mobile game. "
            "Three massive curved living tree trunks form the structural columns. "
            "A broad multi-layered leaf canopy roof in deep green and teal, individual leaves visible at the edges. "
            "An arched wooden entrance doorway with carved leaf and vine motifs. "
            "Warm amber light glowing from within through lattice-woven twig windows. "
            "Climbing ferns and glowing blue mushrooms growing at the base. "
            "The building feels grown not built — organic and deeply magical. "
            + _BUILDING_SUFFIX
        ),
    },

    {
        "zone":  "zen_zone",
        "slug":  "theme_04_autumn_maple",
        "label": "Autumn Maple Temple",
        "ground": (
            "A breathtaking Japanese autumn garden game zone. "
            "Japanese maple (momiji) trees in peak autumn color — brilliant red, orange, and gold leaves. "
            "Wooden walkways crossing a thick carpet of fallen colorful leaves on the ground. "
            "A reflective pond showing orange foliage mirrored in still water. "
            "Stepping stones crossing the pond connected by a curved wooden bridge. "
            "Warm golden afternoon light filtering through the leaf canopy. "
            "Stone lanterns partially dusted in fallen leaves. "
            "Three cleared wooden deck platforms where buildings will be placed. Nostalgic, warm, serene. "
            + _GROUND_SUFFIX
        ),
        "building": (
            "A warm Japanese tea house surrounded by autumn foliage for a mobile game. "
            "Traditional Japanese architecture with natural warm cedar wood grain visible on exterior walls. "
            "A low-pitched hip-and-gable roof in dark charcoal tiles with subtly upturned eaves. "
            "A wraparound wooden engawa porch with polished floorboards. "
            "Shoji screens glowing softly with warm orange lantern light from inside. "
            "Autumn maple branches with brilliant red leaves draping over the entrance. "
            "A traditional stone tsukubai water basin with bamboo water spout at the front. "
            "A small bonsai pine in a ceramic pot beside the entrance. Intimate wabi-sabi beauty. "
            + _BUILDING_SUFFIX
        ),
    },

    {
        "zone":  "zen_zone",
        "slug":  "theme_05_tropical_waterfall",
        "label": "Tropical Waterfall Lagoon",
        "ground": (
            "A lush tropical paradise game zone with a dramatic cascading waterfall. "
            "A large waterfall plunging from rocky cliffs into a vivid turquoise lagoon. "
            "Tropical flowers in bright pink, yellow, and orange: hibiscus, heliconia, bird-of-paradise. "
            "Wooden rope bridges suspended between stone outcroppings over the water. "
            "Giant monstera leaves and tropical ferns in the dense undergrowth. "
            "Exotic parrots perched in tall palm trees. Smooth stones line the water's edge. "
            "Three cleared rock platform areas where buildings will be placed. Paradise, vibrant, lush. "
            + _GROUND_SUFFIX
        ),
        "building": (
            "A floating lotus temple sitting on a turquoise lagoon for a mobile game. "
            "Round lily pad platforms support the structure directly above the water surface. "
            "Four petal-shaped roof layers fanning outward in soft pink and white, like a blooming lotus flower. "
            "A glowing white lotus flower ornament at the very apex. "
            "Slender white columns connecting the petal roofs to the base platform. "
            "Pink and white tropical vines and flowers cascading down the sides. "
            "The building's reflection shimmers in the still turquoise water below. Magical, ethereal. "
            + _BUILDING_SUFFIX
        ),
    },

    {
        "zone":  "zen_zone",
        "slug":  "theme_06_greenhouse_conservatory",
        "label": "Greenhouse Conservatory Garden",
        "ground": (
            "A beautiful Victorian botanical garden game zone. "
            "Ornate wrought iron and glass greenhouse structures as architectural features. "
            "Geometric formal flower beds in neat patterns with low stone borders. "
            "A decorative stone fountain at the center with water flowing. "
            "Stone paths with ornate iron lamp-posts casting warm amber glow. "
            "Topiary bushes trimmed into spheres and pyramid shapes. "
            "Warm late-afternoon light glowing through glass panels. Climbing roses on iron trellises. "
            "Three cleared flat stone-paved areas where buildings will be placed. Victorian, botanical, elegant. "
            + _GROUND_SUFFIX
        ),
        "building": (
            "A grand Victorian glass conservatory dome for a mobile game. "
            "A large hexagonal glass dome with an ornate wrought iron frame in dark bottle-green and gold. "
            "Each glass panel catches warm amber-orange light from exotic tropical plants visible inside. "
            "A grand arched iron entrance with decorative floral ironwork gates. "
            "Small Victorian chimney stacks with curling smoke wisps. "
            "Ivy and climbing roses growing up the iron exterior frame. "
            "Flower window boxes beneath each glass panel. Warm interior plant silhouettes within. Elegant. "
            + _BUILDING_SUFFIX
        ),
    },

    {
        "zone":  "zen_zone",
        "slug":  "theme_07_underwater_reef",
        "label": "Underwater Coral Reef",
        "ground": (
            "An ethereal underwater ocean floor game zone. "
            "Turquoise water with shafts of light filtering down from the surface above. "
            "Colorful coral formations: branching corals in pink and orange, brain corals in green, fan corals in purple. "
            "Bioluminescent jellyfish with trailing tentacles drifting gently. "
            "Schools of tiny tropical fish in bright yellow and blue. "
            "Sandy seafloor paths in pale cream color winding through coral gardens. "
            "Giant clam shells open and closed. Sea anemones with waving tentacles. "
            "Three flat sandy platform clearings for buildings. Ethereal, otherworldly, magical. "
            + _GROUND_SUFFIX
        ),
        "building": (
            "A transparent glass bubble dome habitat on the ocean floor for a mobile game. "
            "A large perfectly round glass bubble structure with visible warm cozy interior. "
            "Furniture and living-space elements silhouetted within the warm amber-glowing dome. "
            "An airlock tube entrance at the front connecting to a smaller adjoining bubble. "
            "Colorful coral gardens in pink, orange, and purple growing around the dome's base. "
            "Purple bioluminescent accents lighting the edges of the dome. "
            "Small round porthole windows around the circumference. Cozy life beneath the sea. "
            + _BUILDING_SUFFIX
        ),
    },

    {
        "zone":  "zen_zone",
        "slug":  "theme_08_floating_cloud_temple",
        "label": "Floating Cloud Temple",
        "ground": (
            "A heavenly game zone on floating cloud platforms in a celestial sky. "
            "Fluffy white and cream cloud platforms at different heights connected by rainbow arching bridges. "
            "Celestial gardens with golden glowing flowers and silver-leafed ethereal trees on the cloud platforms. "
            "Shafts of warm golden light beaming from above. Rainbow stepping-stone paths between platforms. "
            "Gentle mist and cloud wisps between the levels. "
            "A pastel sky gradient in the background: soft blue, lavender, and pink. "
            "Three main cloud platforms as building areas. Heavenly, dreamlike, celestial. "
            + _GROUND_SUFFIX
        ),
        "building": (
            "A magnificent white and gold celestial palace for a mobile game. "
            "Gleaming white marble walls with ornate gold trim and decorative cloud scroll relief carvings. "
            "Soaring multi-layered golden curved roofs with upswept edges and gold finials. "
            "Four slender golden tower spires at the four corners. "
            "Large arched windows with shimmering translucent celestial curtains. "
            "An ornate golden entrance arch with a radiant sun disc motif above the gate. "
            "A celestial golden aura and glow radiating from the palace. Divine, opulent, heavenly. "
            + _BUILDING_SUFFIX
        ),
    },

    {
        "zone":  "zen_zone",
        "slug":  "theme_09_classic_pagoda",
        "label": "Classic Japanese Pagoda (Style Reference)",
        "ground": (
            "The definitive traditional Japanese zen garden — the style reference baseline for this entire project. "
            "Stone-raked sand in concentric circle ripple patterns around three carefully placed stone groupings. "
            "A classical koi pond with a flat stone stepping-stone bridge and visible koi fish. "
            "Old-growth pine trees sculpted in the traditional cloud-pruning (niwa-zukuri) style. "
            "A vermillion red torii gate at the main stone path entrance. "
            "Traditional ishidoro stone lanterns evenly lining the main path. "
            "Three cleared stone-paved platform areas where buildings will be placed. "
            "A bamboo shishi-odoshi water feature. Serene, balanced, timeless perfection. "
            + _GROUND_SUFFIX
        ),
        "building": (
            "The definitive Japanese tea house with wabi-sabi perfection for a mobile game — the style reference. "
            "Weathered natural cedar wood exterior with visible wood grain. "
            "A low, perfectly proportioned hip roof in dark slate-grey tiles with subtly upturned eaves. "
            "A single sliding shoji screen door slightly open, revealing a warm amber interior glow. "
            "A moss-covered natural stone path leading from the frame edge to the entrance. "
            "A traditional bamboo shishi-odoshi water feature to one side. "
            "A carefully shaped bonsai pine in a dark ceramic pot by the door. "
            "Total simplicity, total beauty. This is the gold standard reference. "
            + _BUILDING_SUFFIX
        ),
    },

    # ══════════════════════════════════════════════════════════════════
    #  FITNESS ZONE  (9 themes)
    # ══════════════════════════════════════════════════════════════════

    {
        "zone":  "fitness_zone",
        "slug":  "theme_01_greek_olympic",
        "label": "Ancient Greek Olympic Grounds",
        "ground": (
            "A vast ancient Greek outdoor athletic game zone. "
            "A white marble stadium with curved stone tiered seating at one end. "
            "A smooth sand running track running the length of the ground. "
            "Olive trees with silvery-green leaves lining the perimeter. "
            "A tall laurel wreath archway at the main zone entrance. "
            "Doric column monuments and marble pedestals with bronze athlete statues. "
            "A decorative stone fountain at the center with flowing water. "
            "Stone paths in Greek key pattern connecting three cleared marble platform areas. "
            "Heroic, classical, Mediterranean. "
            + _GROUND_SUFFIX
        ),
        "building": (
            "A classical ancient Greek marble gymnasium building for a mobile game. "
            "Classical Doric columns supporting a triangular pediment with a carved athletic relief scene. "
            "White marble walls with a carved Greek key border motif running along the base. "
            "Wide stone steps leading up to a grand arched entrance. "
            "Two heroic bronze athlete statues flanking the entrance doorway. "
            "Olive branch wreaths as carved frieze decoration. "
            "White marble with gold column capital accents. Noble, classical, athletic excellence. "
            + _BUILDING_SUFFIX
        ),
    },

    {
        "zone":  "fitness_zone",
        "slug":  "theme_02_roman_colosseum",
        "label": "Roman Gladiator Training Colosseum",
        "ground": (
            "A Roman gladiatorial training ground game zone. "
            "Sandy arena floor with battle-worn straw-and-wood training dummies. "
            "Wooden weapon racks along the stone walls holding gladii swords, shields, and spears. "
            "A massive stone arched gateway at the zone perimeter entrance. "
            "Heraldic eagle banners hanging from iron brackets on the stone walls. "
            "Stone bleacher seating visible on one side. "
            "Tall Mediterranean cypress trees in each corner. "
            "Three cleared training platform areas with flat stone bases. Powerful, epic, ancient Rome. "
            + _GROUND_SUFFIX
        ),
        "building": (
            "A stone Roman colosseum training building for a mobile game. "
            "Tiered stone arched arcade facade with three levels of arched stone openings. "
            "An interior sand-filled arena visible through the main entrance arches. "
            "A grand arched main entrance with heavy iron portcullis gate. "
            "Carved imperial eagle crests above the upper-tier windows. "
            "Gladiator shields in crossed pairs as wall decorations. Iron torch sconces with warm orange flame glow. "
            "Imposing, powerful, ancient stone construction. "
            + _BUILDING_SUFFIX
        ),
    },

    {
        "zone":  "fitness_zone",
        "slug":  "theme_03_cloud_athletics",
        "label": "Floating Cloud Kingdom Athletics",
        "ground": (
            "A magical athletic zone on cloud platforms floating in a bright clear blue sky. "
            "Rainbow-colored running tracks looping between large fluffy white cloud platforms. "
            "Cloud-bounce trampoline sections with pillowy white surfaces and rainbow bounce rings. "
            "Rainbow arching bridges connecting cloud platforms. "
            "Cheerful pennant flags in rainbow colors on poles along the tracks. "
            "Celestial energy sparkle trails marking the athletic paths. "
            "Three main cloud platform areas at the center. Playful, magical, joyful, vibrant. "
            + _GROUND_SUFFIX
        ),
        "building": (
            "A magical cloud arena athletic building for a mobile game. "
            "Rounded, soft cloud-like walls in white and sky blue with fluffy texture. "
            "Rainbow color gradient accents along the roof edges and window trim. "
            "A large circular open arena area on the rooftop with rainbow lane markings. "
            "Golden tower finials at the four building corners. "
            "Translucent pastel glass panels with rainbow light refracting through. "
            "A magical rainbow atmospheric aura surrounding the building. Joyful, celestial sports. "
            + _BUILDING_SUFFIX
        ),
    },

    {
        "zone":  "fitness_zone",
        "slug":  "theme_04_shaolin_temple",
        "label": "Shaolin Temple Training Courtyard",
        "ground": (
            "A traditional Chinese Shaolin martial arts temple compound game zone. "
            "A large stone-paved courtyard with rows of wooden training posts (mook jong). "
            "A bronze incense burner at the center with wisps of incense smoke rising. "
            "Bold red lacquered columns forming a perimeter pavilion border. "
            "A circular moon gate (yuemen) opening in the far courtyard wall. "
            "Stone dragon head water spouts at the courtyard corners. "
            "Tall pine trees and dense bamboo groves bordering the compound walls. "
            "Three flat cleared practice areas within the courtyard. Disciplined, powerful, honorable. "
            + _GROUND_SUFFIX
        ),
        "building": (
            "A Shaolin martial arts training hall for a mobile game. "
            "A dramatic upswept curved Chinese hip-and-gable roof in dark forest green tiles. "
            "Red lacquered ridge decoration and golden finials at the roof peaks. "
            "Bold vermillion red structural columns and bright red entrance doors. "
            "White plaster walls with circular window openings. "
            "Carved stone dragon details at the base corners and entrance. "
            "Martial weapons displayed on the exterior walls: wooden staffs and dao swords. "
            "Two stone shishi lion guardians at the entrance. Powerful, red, authentic martial arts. "
            + _BUILDING_SUFFIX
        ),
    },

    {
        "zone":  "fitness_zone",
        "slug":  "theme_05_viking_camp",
        "label": "Viking Warrior Training Camp",
        "ground": (
            "A rugged Norse Viking warrior training camp game zone in a wintry setting. "
            "A large clearing of packed earth and snow-dusted grass. "
            "Circular axe-throwing target rings made from stacked wooden planks. "
            "Fire pits with glowing orange embers and small dancing flames. "
            "Rows of round painted Viking shields on wooden wall racks. "
            "Log longhouse structures at the zone border with smoke rising from holes. "
            "A dense snow-dusted pine forest as the border backdrop. "
            "A partially frozen stream along one edge. "
            "Three cleared training areas with log-reinforced flat bases. Rugged, fierce, Nordic. "
            + _GROUND_SUFFIX
        ),
        "building": (
            "A massive Viking mead hall for a mobile game. "
            "Enormous log construction with thick dark timber beams and a thick thatched roof. "
            "Dramatic curved dragon-head carvings at both roof gable peaks. "
            "Rows of round wooden shields with painted geometric designs lining the upper exterior walls. "
            "Heavy oak double doors with large iron ring pulls and iron stud fittings. "
            "A central smoke hole in the thatched roof with wisps of cooking smoke rising. "
            "A large carved wooden totem pole with Norse rune carvings standing at the entrance. "
            "Iron torch holders flanking the entrance with warm orange fire glow. Massive, powerful, Norse. "
            + _BUILDING_SUFFIX
        ),
    },

    {
        "zone":  "fitness_zone",
        "slug":  "theme_06_samurai_dojo",
        "label": "Samurai Dojo Compound",
        "ground": (
            "A traditional Japanese samurai martial arts campus game zone. "
            "Multiple raked gravel practice areas separated by low stone garden borders. "
            "Bamboo shinai sword racks displayed along the connecting paths. "
            "Stone and moss gardens with carefully placed rocks between training areas. "
            "Japanese maple and pine trees providing natural zone borders. "
            "A covered wooden engawa corridor connecting the training areas. "
            "Traditional stone lanterns at every path intersection. "
            "Three cleared flat training platform areas. Honorable, precise, disciplined, Japanese. "
            + _GROUND_SUFFIX
        ),
        "building": (
            "A Japanese samurai castle armory for a mobile game. "
            "Imposing Japanese castle yagura tower architecture with gleaming white plaster walls. "
            "Dark timber structural framing in a traditional pattern visible against the white plaster. "
            "A dramatic multi-tiered black-tiled castle roof with golden shachihoko fish ornaments at the ridge peaks. "
            "Narrow arrow-slit style windows in the upper stories. "
            "An impressive raised stone foundation base (ishigaki). "
            "Katana, naginata, and yari spears displayed inside the visible entrance hall. "
            "Commanding, beautiful, feudal Japanese power and restraint. "
            + _BUILDING_SUFFIX
        ),
    },

    {
        "zone":  "fitness_zone",
        "slug":  "theme_07_treehouse_course",
        "label": "Treehouse Adventure Course",
        "ground": (
            "A multi-level aerial adventure course built among giant old-growth trees game zone. "
            "Multiple wooden platform levels at different heights among enormous thick tree trunks. "
            "Rope bridges swaying between platforms at various heights. "
            "Cargo net climbing sections stretching between platforms. "
            "Colorful pennant flags and banners marking the routes. "
            "Green grass with massive exposed tree roots on the ground level below. "
            "Safety mat areas in bright colors on the ground level. "
            "Zip line cables stretched between trees with small pulley handles. "
            "Three main elevated platform clusters where building structures anchor. Active, adventurous, fun. "
            + _GROUND_SUFFIX
        ),
        "building": (
            "A grand multi-level treehouse tower for a mobile game. "
            "Built around and between three massive tree trunks used as natural structural pillars. "
            "Multiple floors with wraparound wooden balconies and rope-threaded railings. "
            "A spiral wooden staircase wrapping up the exterior. "
            "A textured climbing wall panel on one face with colorful grip holds. "
            "A wooden rope bridge extending from an upper-floor balcony. "
            "A lookout crow's nest at the very top with a colorful pennant flag. "
            "Wood plank construction with visible rope and bolt fasteners. Warm natural wood, adventurous. "
            + _BUILDING_SUFFIX
        ),
    },

    {
        "zone":  "fitness_zone",
        "slug":  "theme_08_cyberpunk_gym",
        "label": "Cyberpunk Neon Gym",
        "ground": (
            "A futuristic cyberpunk fitness district at night game zone. "
            "Rain-slicked dark urban plaza with puddles reflecting neon lights in purple and teal. "
            "Holographic workout demonstration projections floating above designated training areas. "
            "Urban plants in glowing purple and teal illuminated planters. "
            "Grid-line floor markings in neon purple on the dark ground surface. "
            "Japanese neon katakana signage glowing on surrounding dark building facades. "
            "Light rain effect with visible droplets and wet reflective surfaces. "
            "Three neon-lit designated training platform areas. Dark, vibrant, futuristic, cyberpunk. "
            + _GROUND_SUFFIX
        ),
        "building": (
            "A sleek futuristic cyberpunk gym complex for a mobile game. "
            "A dark glass and chrome facade with purple and teal neon LED strips running up corners and edges. "
            "Large glass window panels showing holographic training displays and active silhouettes inside. "
            "A glowing entrance arch with energy-themed neon art and light trail effects. "
            "Chrome and brushed metal accent panels between the glass sections. "
            "Digital display screens on the exterior showing workout stats and countdown timers. "
            "Cyberpunk Japanese neon kanji signs along the roofline. Atmospheric glow, electric energy. "
            + _BUILDING_SUFFIX
        ),
    },

    {
        "zone":  "fitness_zone",
        "slug":  "theme_09_jungle_ruins",
        "label": "Jungle Temple Ruins Parkour",
        "ground": (
            "An ancient Mayan jungle temple ruins parkour game zone. "
            "Massive crumbling stone staircases at multiple height levels creating a natural parkour environment. "
            "Overgrown stone platforms and ledges reclaimed by lush tropical jungle growth. "
            "Thick tropical vines hanging from carved stone monoliths with Mayan glyph carvings. "
            "Exotic tropical birds — toucans and macaws — perched on the stone ruins. "
            "Ancient stone carvings half-buried in the earth between platforms. "
            "Tropical jungle canopy with shafts of dappled sunlight breaking through. "
            "A small waterfall running over the stone ruins in the background. "
            "Three cleared elevated platform areas for buildings. Mysterious, adventurous, ancient, jungle. "
            + _GROUND_SUFFIX
        ),
        "building": (
            "A dragon training arena built from ancient Mayan stone ruins for a mobile game. "
            "A large circular stone arena with tiered stone-block seating around the perimeter. "
            "Massive dragon head carvings on the exterior walls with stone flame motifs at their mouths. "
            "Four stone fire braziers at the cardinal corners with vivid orange and gold flame glow. "
            "Thick tropical vines growing over the ancient weathered stone masonry. "
            "Worn stone steps leading to an arched main entrance with carved serpent column pillars. "
            "An ancient glowing magical seal carved into the arena floor, visible through the entrance arch. "
            "Powerful, ancient, mysterious, dramatic. "
            + _BUILDING_SUFFIX
        ),
    },
]


# ── Logging helpers ──────────────────────────────────────────────────────────
def load_log() -> list:
    if LOG_PATH.exists():
        try:
            return json.loads(LOG_PATH.read_text(encoding="utf-8"))
        except Exception:
            return []
    return []


def save_log(log: list) -> None:
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.write_text(
        json.dumps(log, indent=2, ensure_ascii=False), encoding="utf-8"
    )


# ── Image generation ─────────────────────────────────────────────────────────
def generate_image(
    prompt: str,
    output_path: Path,
    aspect_ratio: str = "1:1",
    resolution: str = "2K",
) -> bool:
    for attempt in range(MAX_RETRIES):
        try:
            t0 = time.time()
            response = client.models.generate_content(
                model="gemini-3-pro-image-preview",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["TEXT", "IMAGE"],
                    image_config=types.ImageConfig(
                        aspect_ratio=aspect_ratio,
                        image_size=resolution,
                    ),
                ),
            )
            for part in response.parts:
                if part.inline_data is not None:
                    img = Image.open(BytesIO(part.inline_data.data))
                    output_path.parent.mkdir(parents=True, exist_ok=True)
                    img.save(str(output_path), "PNG")
                    elapsed = time.time() - t0
                    print(
                        f"  [ok] Saved  {output_path.name}  "
                        f"({img.width}x{img.height})  ({elapsed:.1f}s)"
                    )
                    return True
            print(f"  [warn] No image in response for {output_path.name}")
            return False

        except Exception as e:
            msg = str(e)
            if "429" in msg or "RESOURCE_EXHAUSTED" in msg:
                wait = RETRY_DELAY_BASE * (attempt + 1)
                print(f"  [rate-limit] attempt {attempt+1} — waiting {wait}s …")
                time.sleep(wait)
            else:
                print(f"  [error] attempt {attempt+1}: {e}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(5 * (attempt + 1))
    return False


# ── Main orchestration ───────────────────────────────────────────────────────
def run() -> None:
    log       = load_log()
    done_set  = {e["output_path"] for e in log if e.get("success")}

    # Build full job list (54 images)
    jobs: list[dict] = []
    for theme in THEMES:
        base = OUT_DIR / theme["zone"] / theme["slug"]
        for v in (1, 2):
            jobs.append(
                dict(
                    out=base / f"ground_v{v}.png",
                    prompt=STYLE + theme["ground"],
                    ar="16:9",
                    res="2K",
                    label=f"{theme['slug']}/ground_v{v}",
                )
            )
        jobs.append(
            dict(
                out=base / "building_v1.png",
                prompt=STYLE + theme["building"],
                ar="1:1",
                res="2K",
                label=f"{theme['slug']}/building_v1",
            )
        )

    total   = len(jobs)   # 54
    skipped = sum(1 for j in jobs if str(j["out"]) in done_set)
    todo    = total - skipped

    zen_count     = sum(1 for t in THEMES if t["zone"] == "zen_zone")
    fitness_count = sum(1 for t in THEMES if t["zone"] == "fitness_zone")

    print("=" * 62)
    print("  Ultraviolet Perigee — Themed Zone Asset Generation")
    print(f"  Themes  : {len(THEMES)}  ({zen_count} Zen + {fitness_count} Fitness)")
    print(f"  Total   : {total} images  |  Skip: {skipped}  |  ToDo: {todo}")
    print("=" * 62)

    for i, job in enumerate(jobs, 1):
        out_str = str(job["out"])
        label   = f"[{i:3d}/{total}]"

        if out_str in done_set:
            print(f"{label} SKIP  {job['label']}")
            continue

        print(f"{label} GEN   {job['label']}")
        success = generate_image(job["prompt"], job["out"], job["ar"], job["res"])

        entry = {
            "output_path": out_str,
            "success":     success,
            "label":       job["label"],
            "timestamp":   datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
        log.append(entry)
        if success:
            done_set.add(out_str)
        save_log(log)

        if i < total:
            time.sleep(DELAY_BETWEEN)

    ok   = sum(1 for e in log if e.get("success"))
    fail = sum(1 for e in log if not e.get("success"))
    print(f"\n{'='*62}")
    print(f"  Complete: {ok} ok, {fail} failed.")
    print(f"  Log: {LOG_PATH}")
    print(f"{'='*62}")


if __name__ == "__main__":
    run()
