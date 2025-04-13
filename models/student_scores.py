"""Model pro ukládání výkonů studentů v disciplínách."""

from db_config import db

class StudentScore(db.Model):
    """Výkon studenta v dané disciplíně."""
    __tablename__ = 'student_scores'
    id = db.Column(db.Integer, primary_key=True)
    zak_id = db.Column(db.Integer, db.ForeignKey('zak.id'), nullable=False)
    discipline_id = db.Column(db.Integer, db.ForeignKey('discipline.id'), nullable=False)
    vykon = db.Column(db.String, nullable=False)
    body = db.Column(db.Integer, nullable=False)
    rocnik = db.Column(db.Integer, nullable=False)  # Ročník žáka (6-9)
    skolni_rok = db.Column(db.Integer, nullable=True)  # Školní rok (např. 2024 pro 2024/2025)
    
    # Vztahy k ostatním tabulkám - používáme lazy loading
    # Definujeme relace pomocí stringů místo přímých importů
    zak = db.relationship('Zak', backref=db.backref('student_scores', lazy=True))
    discipline = db.relationship('Discipline')
    
    def __repr__(self):
        return f"<StudentScore {self.zak_id} - {self.discipline_id} - {self.rocnik}>"