import json
import unittest
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class CatalogTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.payload = json.loads((ROOT / "catalog" / "challenges.json").read_text())
        cls.challenges = cls.payload["challenges"]

    def test_expected_archive_size(self):
        self.assertEqual(126, len(self.challenges))

    def test_year_counts(self):
        self.assertEqual(
            {2018: 7, 2019: 19, 2020: 15, 2021: 20, 2022: 11, 2024: 16, 2025: 17, 2026: 21},
            dict(sorted(Counter(item["year"] for item in self.challenges).items())),
        )

    def test_ids_are_unique(self):
        ids = [item["id"] for item in self.challenges]
        self.assertEqual(len(ids), len(set(ids)))

    def test_workspaces_and_links(self):
        for item in self.challenges:
            self.assertTrue((ROOT / item["workspace"] / "README.md").is_file())
            self.assertTrue(item["upstream_url"].startswith("https://github.com/"))


if __name__ == "__main__":
    unittest.main()

