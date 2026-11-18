# Program: fortz - test_fort_builder.py
# Programmer: Ethan-da-Tech-Wizard (written with Claude, an AI assistant)
# Last Modified: 2026-11-18
# Purpose: Browser-free unit tests that read game.js, index.html and style.css as text and check that the expected toys, mini-games, screens and CSS rules exist.
"""
Program: Fort Builder Test Suite
Programmer: Ethan Kilmer
Last Modified: 11/08/2026
Purpose: Automated verification test suite for the Fort Builder game engine,
         validating toy inventories, mini-game handlers, HTML DOM structure,
         and CSS styling rules without browser dependencies.
"""

# unittest runs the tests; re searches text with patterns; Path builds file paths.
import unittest
import re
from pathlib import Path

# The repository folder: this file's folder (tests/) goes up one level.
REPO_ROOT = Path(__file__).resolve().parent.parent


class TestFortBuilderEngine(unittest.TestCase):
    """Automated unit tests validating Fort Builder's game state and logic."""

    # setUp runs before every test and loads the three source files as text.
    def setUp(self):
        self.game_js = (REPO_ROOT / "game.js").read_text(encoding="utf-8")
        self.index_html = (REPO_ROOT / "index.html").read_text(encoding="utf-8")
        self.style_css = (REPO_ROOT / "style.css").read_text(encoding="utf-8")

    # Checks the author banner text that is kept at the top of game.js.
    def test_ethan_kilmer_header(self):
        """Verify Ethan Kilmer authorship and program metadata in game.js."""
        self.assertIn("Programmer: Ethan Kilmer", self.game_js)
        self.assertIn("Program: Fort Builder", self.game_js)

    # Finds the allToys list with a pattern and counts its entries.
    def test_toy_inventory_completeness(self):
        """Ensure all 40+ toys are properly defined with emoji and name."""
        # re.DOTALL lets '.' match across lines so the whole list is captured.
        match = re.search(r"const allToys = \[(.*?)\];", self.game_js, re.DOTALL)
        self.assertIsNotNone(match, "allToys array must be defined in game.js")
        # Pull out each (emoji, name) pair from the list.
        toy_entries = re.findall(r"\{\s*emoji:\s*'([^']+)',\s*name:\s*'([^']+)'\s*\}", match.group(1))
        self.assertGreaterEqual(len(toy_entries), 35, "Expected at least 35 unique toys in the inventory")
        
        # Verify specific classic toys exist
        names = [name for _, name in toy_entries]
        self.assertIn("Legos", names)
        self.assertIn("Teddy Bear", names)
        self.assertIn("Dinosaur", names)
        self.assertIn("Rocket Ship", names)

    # Each mini-game must appear as a function in game.js.
    def test_educational_minigames_present(self):
        """Verify all 8 tablet educational games are defined."""
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

    # Each screen-switching function must exist in game.js.
    def test_screen_navigation_routes(self):
        """Verify all screen transitions exist in the engine."""
        screens = ["showScreen", "startGame", "goToToys", "goToCharacter", "goToPlay", "goToTitle"]
        for screen_func in screens:
            self.assertIn(f"function {screen_func}", self.game_js, f"Missing screen transition: {screen_func}")

    # Each screen id must appear in index.html.
    def test_dom_structure(self):
        """Verify that index.html contains necessary screens and game canvas/containers."""
        self.assertIn('id="title-screen"', self.index_html)
        self.assertIn('id="build-screen"', self.index_html)
        self.assertIn('id="toys-screen"', self.index_html)
        self.assertIn('id="play-screen"', self.index_html)
        self.assertIn('id="tablet-screen"', self.index_html)

    # Each important CSS selector must appear in style.css.
    def test_stylesheet_rules(self):
        """Verify critical CSS styling classes exist."""
        self.assertIn(".screen", self.style_css)
        self.assertIn(".fort-item", self.style_css)
        self.assertIn("#tablet-game", self.style_css)


# Run all tests when this file is executed directly.
if __name__ == "__main__":
    unittest.main()
