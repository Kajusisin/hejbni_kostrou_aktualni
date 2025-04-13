from flask import Flask
import pandas as pd
from db_config import db, DATABASE_URI
from models import Zak

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

def import_zaci(soubor):
    try:
        with app.app_context():
            with db.session.no_autoflush:
                print(f"🚀 Spouštím import žáků z {soubor}...")
                df = pd.read_excel(soubor)

                for index, row in df.iterrows():
                    jmeno = str(row['Jméno']).strip()  # Text
                    prijmeni = str(row['Příjmení']).strip()  # Text
                    pohlavi = str(row.get('Pohlaví', 'neuvedeno')).strip().lower()  # Text

                    cislo_tridy = int(row['Číslo třídy']) if pd.notna(row.get('Číslo třídy')) else None  # Celé číslo
                    pismeno_tridy = str(row['Písmeno třídy']).strip() if pd.notna(row.get('Písmeno třídy')) else None  # Text
                    if pismeno_tridy and pismeno_tridy.startswith('.'):
                        pismeno_tridy = pismeno_tridy[1:]

                    rok_nastupu_2_stupen = int(row['Rok nástupu na 2. stupeň']) if 'Rok nástupu na 2. stupeň' in row and pd.notna(row['Rok nástupu na 2. stupeň']) else None  # Celé číslo
                    skolni_rok_odchodu_od = int(row['Školní rok odchodu z 2. stupně od']) if 'Školní rok odchodu z 2. stupně od' in row and pd.notna(row.get('Školní rok odchodu z 2. stupně od')) else None  # Celé číslo
                    skolni_rok_odchodu_do = int(row['Školní rok odchodu z 2. stupně do']) if 'Školní rok odchodu z 2. stupně do' in row and pd.notna(row.get('Školní rok odchodu z 2. stupně do')) else None  # Celé číslo

                    if not cislo_tridy or not rok_nastupu_2_stupen:
                        print(f"⚠️ Přeskakuji žáka {jmeno} {prijmeni} - chybí číslo třídy nebo rok nástupu.")
                        continue

                    if rok_nastupu_2_stupen is None:
                        print(f"⚠️ Pro žáka {jmeno} {prijmeni} chybí rok nástupu - přeskakuji")
                        continue

                    existing_zak = Zak.query.filter_by(jmeno=jmeno, prijmeni=prijmeni).first()
                    if existing_zak:
                        existing_zak.cislo_tridy = cislo_tridy
                        existing_zak.pismeno_tridy = pismeno_tridy
                        existing_zak.pohlavi = pohlavi
                        existing_zak.rok_nastupu_2_stupen = rok_nastupu_2_stupen
                        existing_zak.skolni_rok_odchodu_od = skolni_rok_odchodu_od
                        existing_zak.skolni_rok_odchodu_do = skolni_rok_odchodu_do
                    else:
                        # OPRAVA: Správná inicializace objektu bez pojmenovaných parametrů
                        new_zak = Zak()
                        new_zak.jmeno = jmeno
                        new_zak.prijmeni = prijmeni
                        new_zak.cislo_tridy = cislo_tridy
                        new_zak.pismeno_tridy = pismeno_tridy
                        new_zak.pohlavi = pohlavi
                        new_zak.rok_nastupu_2_stupen = rok_nastupu_2_stupen
                        new_zak.skolni_rok_odchodu_od = skolni_rok_odchodu_od
                        new_zak.skolni_rok_odchodu_do = skolni_rok_odchodu_do
                        db.session.add(new_zak)

                db.session.commit()
                print("✅ Import žáků dokončen!")
                return True
    except Exception as e:
        db.session.rollback()
        print(f"❌ Chyba při importu žáků: {e}")
        return False

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        import_zaci("zaci.xlsx")