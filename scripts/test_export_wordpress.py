"""Tests for the HTML and data conversions. Run: python3 -m unittest discover -s scripts"""
import unittest

from export_wordpress import markdown, paragraphs, parse_grams, text


class ConversionTests(unittest.TestCase):
    def test_text_decodes_entities_and_inline_tags(self):
        self.assertEqual(text('Matcha &#8212; <span class="x">Uji</span>.'), 'Matcha — Uji.')

    def test_paragraphs_are_separated_by_blank_lines(self):
        self.assertEqual(paragraphs('<p data-x="1">One\n two.</p>\n<p>Three.</p>'), 'One two.\n\nThree.')

    def test_unknown_html_fails_instead_of_disappearing(self):
        with self.assertRaises(ValueError):
            paragraphs('<p>Kept.</p><ul><li>Lost?</li></ul>')

    def test_markdown_headings_and_bold(self):
        self.assertEqual(markdown('<h2>Grades</h2><p>Use <strong>ceremonial</strong>.</p>'), '## Grades\n\nUse **ceremonial**.\n')

    def test_parse_grams(self):
        self.assertEqual(parse_grams('100g'), 100)
        self.assertEqual(parse_grams('30 g'), 30)
        with self.assertRaises(ValueError):
            parse_grams('large')


if __name__ == '__main__':
    unittest.main()
