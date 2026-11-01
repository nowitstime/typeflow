#!/usr/bin/env python3
"""
TypeFlow Build & Bundling Script
Combines src/template.html, style.css, and src/**/*.js into a single standalone index.html
so that Android content:// URIs and standard browsers load seamlessly without CORS/sub-resource blocks.
"""

import os
import sys
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def clean_css(css):
    """Strips block comments and collapses empty lines from CSS while preserving rules."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.DOTALL)
    lines = [l for l in css.splitlines() if l.strip()]
    return "\n".join(lines)


def clean_js(js):
    """Strips JSDoc/block comments at line boundaries and single-line comments while preserving string literals."""
    js = re.sub(r"(?m)^\s*/\*.*?\*/\s*$", "", js, flags=re.DOTALL)
    out_lines = []
    for line in js.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("//"):
            continue
        if "//" in line and '"' not in line and "'" not in line and '`' not in line:
            line = re.sub(r"\s*//.*$", "", line)
        if line.strip():
            out_lines.append(line)
    return "\n".join(out_lines)


def build():
    print("[TypeFlow] Starting build with Observable MVC modules...")

    css_path = os.path.join(BASE_DIR, "style.css")
    template_path = os.path.join(BASE_DIR, "src", "template.html")
    output_path = os.path.join(BASE_DIR, "index.html")

    for req_path in (css_path, template_path):
        if not os.path.exists(req_path):
            print(f"Error: Missing required file {req_path}")
            sys.exit(1)

    with open(css_path, "r", encoding="utf-8") as f:
        css_content = clean_css(f.read())

    mvc_modules = [
        "src/core/Constants.js",
        "src/core/EventEmitter.js",
        "src/models/BigramLedger.js",
        "src/models/WordsModel.js",
        "src/models/FlowModel.js",
        "src/models/SessionModel.js",
        "src/models/EggNestModel.js",
        "src/models/GhostPacerModel.js",
        "src/models/AchievementsModel.js",
        "src/models/CosmeticsModel.js",
        "src/services/StorageService.js",
        "src/services/AudioService.js",
        "src/views/StageView.js",
        "src/views/NestView.js",
        "src/views/HUDView.js",
        "src/views/ChartView.js",
        "src/views/ModalView.js",
        "src/controllers/KeyboardController.js",
        "src/controllers/GameController.js",
        "src/bootstrap.js"
    ]

    bundled_js_parts = []
    for mod_rel in mvc_modules:
        mod_path = os.path.join(BASE_DIR, mod_rel)
        if not os.path.exists(mod_path):
            print(f"Error: Missing required module {mod_path}")
            sys.exit(1)
        with open(mod_path, "r", encoding="utf-8") as f:
            bundled_js_parts.append(clean_js(f.read()))

    bundled_js = "\n".join(bundled_js_parts)

    with open(template_path, "r", encoding="utf-8") as f:
        html_template = f.read()

    # Strip HTML comments before injecting CSS/JS so JS string literals stay untouched
    cleaned_template = re.sub(r"<!--.*?-->", "", html_template, flags=re.DOTALL)
    populated_html = (
        cleaned_template
        .replace("/* __TYPEFLOW_CSS__ */", css_content)
        .replace("/* __TYPEFLOW_JS__ */", bundled_js)
    )
    cleaned_html_lines = [l for l in populated_html.splitlines() if l.strip()]
    final_output = "\n".join(cleaned_html_lines) + "\n"

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(final_output)

    size_kb = os.path.getsize(output_path) / 1024
    print(f"[TypeFlow] Build complete! index.html generated ({size_kb:.1f} KB).")


if __name__ == "__main__":
    build()
