# 🏰 Fort Builder

> **Programmer:** Ethan Kilmer  
> **Last Modified:** 11/08/2026  
> **Architecture:** Zero-dependency vanilla HTML5, CSS3, and JavaScript (ES6+)

A playful, interactive drag-and-drop web game where kids build their dream blanket fort, pick an inventory of toys, customize their avatar, and play inside the fort with 8 built-in educational mini-games.

---

## 🌟 Key Features

- **🏰 Drag-and-Drop Fort Construction:**
  - Colorful blankets (Red, Blue, Purple, Green, Yellow, Rainbow).
  - Soft pillows (White, Pink, Star, Heart, Moon).
  - Ambient decorative fairy lights.
- **🧸 Comprehensive Toy Catalog:**
  - 40 unique interactive toys across categories (Sports, Action, Prehistoric, Fantasy, Vehicles, Musical Instruments, Science & Mystery).
  - Interactive popup animations and sounds when toys are interacted with inside the fort.
- **👤 Avatar Customization:**
  - Hair style, facial expression, shirt, shoes, and personalized player name.
  - Interactive in-fort animations (Wave, Dance, Jump, Sleep).
- **📱 8 Embedded Educational Tablet Games:**
  1. **Math Fun:** Dynamic arithmetic challenges tailored for young learners.
  2. **Spelling:** Word-building and letter identification.
  3. **Colors:** Color matching and chromatic recognition.
  4. **Counting:** Visual quantity estimation and item counting.
  5. **Shapes:** Geometric pattern recognition.
  6. **Animals:** Wildlife identification and sound association.
  7. **Music:** Interactive 4-channel virtual tone synthesizer pad.
  8. **Drawing:** Responsive freehand canvas drawing pad with color palette.

---

## 🚀 Quick Start

No installations, build steps, or server dependencies required.

```bash
# Clone the repository
git clone https://github.com/Ethan-da-Tech-Wizard/fortz.git
cd fortz

# Open in your browser
xdg-open index.html   # Linux
open index.html       # macOS
start index.html      # Windows
```

---

## 🧪 Automated Verification & Testing

Fort Builder includes a regression test suite validating state models, DOM containers, and educational games:

```bash
python3 -m unittest discover -s tests -v
```

All 6 automated test cases pass with zero dependencies:
- `test_ethan_kilmer_header`: Validates authorship and metadata integrity.
- `test_toy_inventory_completeness`: Confirms 40-item catalog integrity.
- `test_educational_minigames_present`: Verifies all 8 educational tablet game handlers.
- `test_screen_navigation_routes`: Tests state transitions across all 5 game scenes.
- `test_dom_structure`: Confirms structural integrity of containers and modals.
- `test_stylesheet_rules`: Validates styling selectors.

---

## 📜 License

Released under the [MIT License](LICENSE).
