"""
Balíček modelů pro aplikaci Hejbni kostrou.
"""

# Nová implementace - přímé importy ze souborů
from models.zak import Zak
from models.disciplines import Discipline, Score
from models.student_scores import StudentScore
from models.skolni_rok import SkolniRok
from models.odkazy_info import Odkaz, Informace, Soubor

# Export pro zachování kompatibility
__all__ = [
    'Zak',
    'Discipline',
    'Score',
    'StudentScore',
    'SkolniRok',
    'Odkaz',
    'Informace',
    'Soubor'
]