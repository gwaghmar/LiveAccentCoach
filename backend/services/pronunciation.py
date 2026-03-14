"""
Pronunciation scoring module
Analyzes and scores user pronunciation against coaching feedback
"""

import logging
import re
from typing import List

logger = logging.getLogger(__name__)


class PronunciationScorer:
    """Scores user pronunciation based on Gemini feedback"""
    
    @staticmethod
    def extract_score_from_feedback(feedback_text: str) -> int:
        """
        Extract accuracy score (0-100) from Gemini feedback
        
        Args:
            feedback_text: Coaching feedback from Gemini
            
        Returns:
            int: Accuracy score (0-100)
        """
        try:
            # Try different patterns seen in freeform model output
            patterns = [
                r'ACCURACY:\s*(\d+)',
                r'accuracy[:\s]+(\d+)',
                r'score[:\s]+(\d+)',
                r'(\d+)\s*out of\s+100',  # 88 out of 100
                r'performance[:\s]+(\d+)',  # performance: 85
                r'(\d+)\s*%',
            ]

            for pattern in patterns:
                match = re.search(pattern, feedback_text, re.IGNORECASE)
                if match:
                    score = int(match.group(1))
                    return min(100, max(0, score))

            return 50
        except Exception as e:
            logger.error(f"Error extracting score: {e}")
            return 0

    @staticmethod
    def extract_corrections(feedback_text: str) -> List[str]:
        """Extract pronunciation corrections from feedback text."""
        try:
            if not feedback_text:
                return []

            section_match = re.search(
                r'CORRECTIONS:\s*(.*?)(?:\n\s*-?\s*TIPS:|$)',
                feedback_text,
                flags=re.IGNORECASE | re.DOTALL,
            )

            if section_match:
                section = section_match.group(1).strip()
                bullet_items = re.findall(r'[-•]\s*(.+)', section)
                if bullet_items:
                    return [item.strip() for item in bullet_items if item.strip()]

                csv_items = [item.strip() for item in section.split(',') if item.strip()]
                if csv_items:
                    return csv_items

            candidates = re.findall(
                r"(?:pronounce|focus on|improve|avoid)\s+([^\.\n]+)",
                feedback_text,
                flags=re.IGNORECASE,
            )
            return [c.strip() for c in candidates[:5] if c.strip()]
        except Exception as e:
            logger.error(f"Error extracting corrections: {e}")
            return []

    @staticmethod
    def extract_tips(feedback_text: str) -> List[str]:
        """Extract actionable tips from feedback text."""
        try:
            if not feedback_text:
                return []

            section_match = re.search(
                r'TIPS:\s*(.*)$',
                feedback_text,
                flags=re.IGNORECASE | re.DOTALL,
            )
            if not section_match:
                return []

            section = section_match.group(1).strip()
            bullet_items = re.findall(r'[-•]\s*(.+)', section)
            if bullet_items:
                return [item.strip() for item in bullet_items if item.strip()]

            return [item.strip() for item in section.split(',') if item.strip()]
        except Exception as e:
            logger.error(f"Error extracting tips: {e}")
            return []
