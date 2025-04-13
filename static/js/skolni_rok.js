/**
 * Funkce školního roku - zkrat pro práci se školními roky
 */

// Modul pro práci se školním rokem
const SkolniRok = {
    /**
     * Získá aktuální školní rok
     * @returns {string} Školní rok ve formátu "YYYY/YYYY+1"
     */
    getAktualniRok: function() {
        return localStorage.getItem("skolniRok") || "2025/2026";
    },
    
    /**
     * Nastaví nový školní rok
     * @param {string} rok - Školní rok ve formátu "YYYY/YYYY+1"
     */
    nastavRok: function(rok) {
        localStorage.setItem("skolniRok", rok);
        return this.synchronizujSeServerem(rok);
    },
    
    /**
     * Synchronizuje rok s backend serverem
     * @param {string} rok - Školní rok
     */
    synchronizujSeServerem: function(rok) {
        return fetch("/synchronizovat_rok", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ rok: rok })
        })
        .then(response => response.json())
        .catch(error => {
            console.error("Chyba při synchronizaci roku:", error);
            return { error: true, message: error.message };
        });
    }
};

// Export modulu, pokud jsme v Node.js prostředí
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkolniRok;
}

console.log("✅ Modul školní rok načten");