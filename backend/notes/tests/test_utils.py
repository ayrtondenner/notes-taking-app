from datetime import timedelta

import pytest
from django.utils import timezone

from notes.utils import format_note_date


class TestFormatNoteDate:
    def test_today(self):
        assert format_note_date(timezone.now()) == "today"

    def test_yesterday(self):
        yesterday = timezone.now() - timedelta(days=1)
        assert format_note_date(yesterday) == "yesterday"

    def test_older_date(self):
        old = timezone.now() - timedelta(days=10)
        result = format_note_date(old)
        assert result != "today"
        assert result != "yesterday"
        # Should be "Month Day" format (e.g., "February 23")
        assert any(month in result for month in [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ])

    def test_no_leading_zero_in_day(self):
        # Create a date with a single-digit day
        from datetime import date
        d = date(2024, 7, 5)
        result = format_note_date(d)
        assert result == "July 5"
