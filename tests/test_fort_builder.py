# ==============================================================================
# Program: test_fort_builder.py
# Programmer: Ethan-da-Tech-Wizard
# Last Modified: November 18, 2026
# Purpose: Automated verification test suite for the Fort Builder game engine,
#          validating toy inventories, educational mini-game handlers, HTML DOM
#          structure, and CSS styling rules without browser dependencies.
#
# How it fits: these are STATIC checks. The suite reads game.js, index.html and style.css as
#   plain text and greps them with `in` and regular expressions. It never executes the
#   JavaScript, so it catches deleted/renamed functions, missing screens and a shrunken toy
#   catalogue, but NOT runtime logic errors (movement clamping, scoring, DOM updates).
#   A real behavioural test would need a browser or jsdom, which this zero-dependency repo
#   deliberately avoids.
# Run: `python3 -m unittest discover -s tests` from the repo root (about 6 tests, <1s).
#   Python writes tests/__pycache__ when it runs; that folder is git-ignored.
# ==============================================================================

import unittest
import re
from pathlib import Path

# tests/ sits one level below the repo root; resolving via __file__ makes the suite work
# from any current directory.
REPO_ROOT = Path(__file__).resolve().parent.parent


class TestFortBuilderEngine(unittest.TestCase):
    """Automated unit tests validating Fort Builder's game state, DOM, and logic."""

    def setUp(self):
        # Read the three front-end files once per test (cheap, and each test starts from the
        # file's current on-disk text). UTF-8 is explicit because the sources contain emoji and
        # the platform default encoding is not always UTF-8.
        self.game_js = (REPO_ROOT / "game.js").read_text(encoding="utf-8")
        self.index_html = (REPO_ROOT / "index.html").read_text(encoding="utf-8")
        self.style_css = (REPO_ROOT / "style.css").read_text(encoding="utf-8")

    def test_ethan_kilmer_header(self):
        """Verify Ethan Kilmer authorship and program metadata in game.js."""
        # Pins the authorship header. The program-header convention used across this repo
        # puts these exact strings in game.js, so a future header rewrite must keep them or
        # this test fails on purpose.
        self.assertIn("Programmer: Ethan Kilmer", self.game_js)
        self.assertIn("Program: Fort Builder", self.game_js)

    def test_toy_inventory_completeness(self):
        """Ensure all 40+ toys are properly defined with emoji and name."""
        # Scenario: slice the text between `const allToys = [` and the closing `];` (DOTALL so
        # the match spans lines; non-greedy so it stops at the first closing bracket).
        match = re.search(r"const allToys = \[(.*?)\];", self.game_js, re.DOTALL)
        self.assertIsNotNone(match, "allToys array must be defined in game.js")
        
        # Count entries shaped exactly `{ emoji: '..', name: '..' }`; an entry with a different
        # shape (extra field, double quotes) would not be counted, which is the point: the UI
        # and toggleToy rely on that uniform shape. The floor is 35 (the catalogue has 40) so a
        # few can be removed without editing the test but a broken table is noticed.
        toy_entries = re.findall(r"\{\s*emoji:\s*'([^']+)',\s*name:\s*'([^']+)'\s*\}", match.group(1))
        self.assertGreaterEqual(len(toy_entries), 35, "Expected at least 35 unique toys in the inventory")
        
        # Spot-check four well-known toys by name so an accidental truncation or a swapped
        # table is caught even if the count still passes.
        names = [name for _, name in toy_entries]
        self.assertIn("Legos", names)
        self.assertIn("Teddy Bear", names)
        self.assertIn("Dinosaur", names)
        self.assertIn("Rocket Ship", names)

    def test_educational_minigames_present(self):
        """Verify all 8 tablet educational games are defined."""
        # playTabletGame in game.js dispatches to these eight names; if one is renamed or
        # deleted its app icon would silently open an empty panel at runtime. Matching the text
        # `function <name>` (a declaration) rather than any mention avoids false passes from
        # comments or the switch statement itself.
        required_games = [
            "startMathGame",
            "startSpellingGame",
            "startColorsGame",
            "startCountingGame",
            "startShapesGame",
            "startAnimalsGame",
            "startMusicGame",
            "startDrawingGame"
        ]
        for game_func in required_games:
            self.assertIn(f"function {game_func}", self.game_js, f"Missing educational game: {game_func}")

    def test_screen_navigation_routes(self):
        """Verify all screen transitions exist in the engine."""
        # These six functions are the screen flow (title -> build -> toys -> character ->
        # play) that index.html's onclick attributes call; a missing one breaks a button.
        screens = ["showScreen", "startGame", "goToToys", "goToCharacter", "goToPlay", "goToTitle"]
        for screen_func in screens:
            self.assertIn(f"function {screen_func}", self.game_js, f"Missing screen transition: {screen_func}")

    def test_dom_structure(self):
        """Verify that index.html contains necessary screens and game canvas/containers."""
        # Every screen id used by showScreen() must exist in the page, otherwise navigation
        # throws a TypeError at runtime. (character-screen is not asserted here; this list
        # covers five of the six screens.)
        self.assertIn('id="title-screen"', self.index_html)
        self.assertIn('id="build-screen"', self.index_html)
        self.assertIn('id="toys-screen"', self.index_html)
        self.assertIn('id="play-screen"', self.index_html)
        self.assertIn('id="tablet-screen"', self.index_html)

    def test_stylesheet_rules(self):
        """Verify critical CSS styling classes exist."""
        # Guards the three selectors the game cannot work without: .screen (screen switching),
        # .fort-item (placed items) and #tablet-game (hide/show of the active mini-game).
        self.assertIn(".screen", self.style_css)
        self.assertIn(".fort-item", self.style_css)
        self.assertIn("#tablet-game", self.style_css)


# Allows `python3 tests/test_fort_builder.py` as well as discovery via unittest.
if __name__ == "__main__":
    unittest.main()
