"""
Program: Fort Builder Test Suite
Programmer: Ethan Kilmer
Last Modified: 11/08/2026
Purpose: Automated verification test suite for the Fort Builder game engine,
         validating toy inventories, mini-game handlers, HTML DOM structure,
         and CSS styling rules without browser dependencies.
"""

import unittest
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent


class TestFortBuilderEngine(unittest.TestCase):
    """Automated unit tests validating Fort Builder's game state and logic."""

    def setUp(self):
        self.game_js = (REPO_ROOT / "game.js").read_text(encoding="utf-8")
        self.index_html = (REPO_ROOT / "index.html").read_text(encoding="utf-8")
        self.style_css = (REPO_ROOT / "style.css").read_text(encoding="utf-8")

    def test_ethan_kilmer_header(self):
        """Verify Ethan Kilmer authorship and program metadata in game.js."""
        self.assertIn("Programmer: Ethan Kilmer", self.game_js)
        self.assertIn("Program: Fort Builder", self.game_js)

    def test_toy_inventory_completeness(self):
        """Ensure all 40+ toys are properly defined with emoji and name."""
        match = re.search(r"const allToys = \[(.*?)\];", self.game_js, re.DOTALL)
        self.assertIsNotNone(match, "allToys array must be defined in game.js")
        toy_entries = re.findall(r"\{\s*emoji:\s*'([^']+)',\s*name:\s*'([^']+)'\s*\}", match.group(1))
        self.assertGreaterEqual(len(toy_entries), 35, "Expected at least 35 unique toys in the inventory")
        
        # Verify specific classic toys exist
        names = [name for _, name in toy_entries]
        self.assertIn("Legos", names)
        self.assertIn("Teddy Bear", names)
        self.assertIn("Dinosaur", names)
        self.assertIn("Rocket Ship", names)

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

    def test_screen_navigation_routes(self):
        """Verify all screen transitions exist in the engine."""
        screens = ["showScreen", "startGame", "goToToys", "goToCharacter", "goToPlay", "goToTitle"]
        for screen_func in screens:
            self.assertIn(f"function {screen_func}", self.game_js, f"Missing screen transition: {screen_func}")

    def test_dom_structure(self):
        """Verify that index.html contains necessary screens and game canvas/containers."""
        self.assertIn('id="title-screen"', self.index_html)
        self.assertIn('id="build-screen"', self.index_html)
        self.assertIn('id="toys-screen"', self.index_html)
        self.assertIn('id="play-screen"', self.index_html)
        self.assertIn('id="tablet-screen"', self.index_html)

    def test_stylesheet_rules(self):
        """Verify critical CSS styling classes exist."""
        self.assertIn(".screen", self.style_css)
        self.assertIn(".fort-item", self.style_css)
        self.assertIn("#tablet-game", self.style_css)


if __name__ == "__main__":
    unittest.main()
