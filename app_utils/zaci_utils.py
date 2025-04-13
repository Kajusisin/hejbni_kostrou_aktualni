"""Pomocné funkce pro práci se žáky."""

# Správně importujeme Zak přímo z modulu zak
from models.zak import Zak
from models.student_scores import StudentScore
from sqlalchemy import or_

def get_all_zaci():
    """Vrátí seznam všech žáků seřazený podle příjmení a jména."""
    # Oprava: Explicitní specifikace pořadí řazení (vzestupně)
    return Zak.query.order_by(Zak.prijmeni.asc(), Zak.jmeno.asc()).all()

def vyhledat_zaky(query):
    """Vyhledá žáky podle zadaného dotazu."""
    return Zak.query.filter(
        or_(
            Zak.jmeno.ilike(f"%{query}%"),
            Zak.prijmeni.ilike(f"%{query}%")
        )
    ).order_by(Zak.prijmeni, Zak.jmeno).all()

def get_zak_by_id(zak_id):
    """Vrátí žáka podle ID."""
    return Zak.query.get_or_404(zak_id)

def get_student_scores(zak_id, rocnik=None):
    """Vrátí výkony žáka pro daný ročník."""
    query = StudentScore.query.filter_by(zak_id=zak_id)
    if rocnik:
        query = query.filter_by(rocnik=rocnik)
    return query.all() or []  # ochrana proti None