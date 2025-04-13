/**
 * Načte souhrn výkonů žáka ze serveru
 * @param {number} zakId - ID žáka
 * @param {number} rocnik - Ročník žáka
 * @param {number} skolniRok - Školní rok
 * @returns {Promise} Promise s daty souhrnu
 */
async function getStudentSummary(zakId, rocnik, skolniRok) {
    try {
        const response = await fetch(`/student_summary?zak_id=${zakId}&rocnik=${rocnik}&skolni_rok=${skolniRok}`);
        if (!response.ok) {
            throw new Error(`Server odpověděl s chybou: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("❌ Chyba při načítání souhrnu žáka:", error);
        return null;
    }
}

/**
 * Aktualizuje UI elementy s daty žáka
 * @param {Object} summary - Data souhrnu ze serveru
 */
function updateStudentSummaryUI(summary) {
    // Aktualizace bodů
    const totalPointsEl = document.getElementById("totalPoints");
    if (totalPointsEl) {
        totalPointsEl.innerText = `Body: ${summary.total_with_bonus}`;
    }
    
    // Aktualizace průměru
    const averagePointsEl = document.getElementById("averagePoints");
    if (averagePointsEl) {
        averagePointsEl.innerText = `Průměr: ${summary.average}`;
    }
    
    // Aktualizace známky
    const finalGradeEl = document.getElementById("finalGrade");
    if (finalGradeEl) {
        finalGradeEl.innerText = `Známka: ${summary.grade || "-"}`;
    }
    
    // Aktualizace počtu disciplín
    const completedDisciplinesEl = document.getElementById("completedDisciplines");
    if (completedDisciplinesEl) {
        completedDisciplinesEl.innerText = `Počet zapsaných disciplín: ${summary.completed_disciplines}`;
    }
}

/**
 * Uloží výkon žáka na server
 * @param {number} zakId - ID žáka
 * @param {number} disciplineId - ID disciplíny
 * @param {string} vykon - Výkon
 * @param {number} rocnik - Ročník
 * @param {number} skolniRok - Školní rok
 */
function ulozVykon(zakId, disciplineId, vykon, rocnik, skolniRok) {
    fetch("/ulozit_vykon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            zak_id: zakId,
            discipline_id: disciplineId,
            vykon: vykon,
            rocnik: rocnik,
            skolni_rok: skolniRok
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log("✅ Výkon uložen:", data);
    })
    .catch(err => console.error("❌ Chyba při ukládání výkonu:", err));
}

/**
 * Vypočítá body na základě výkonu a uloží je na server
 * @param {HTMLInputElement} input - Vstupní pole výkonu
 * @param {number} disciplinaId - ID disciplíny
 */
function calculatePoints(input, disciplinaId) {
    let vykon = input.value.trim();
    if (!vykon || isNaN(vykon)) {
        console.error("❌ Neplatný výkon:", vykon);
        return;
    }

    // Pokračujeme pouze s platnými hodnotami
    fetch(`/ulozit_vykon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            discipline_id: disciplinaId,
            vykon: vykon
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("✅ Výkon uložen:", data);
    })
    .catch(error => console.error("❌ Chyba při ukládání výkonu:", error));
}

// Přidání funkcionality pro ukládání výkonů
document.addEventListener("DOMContentLoaded", function () {
    const rocnikElement = document.getElementById("selectedRocnik");
    // Bezpečnostní kontrola, zda element existuje
    if (rocnikElement) {
        const vybranyRocnik = rocnikElement.value;
        nactiVykony(vybranyRocnik);
    }

    const buttons = document.querySelectorAll(".ulozit-vykon-btn");

    buttons.forEach(button => {
        button.addEventListener("click", async () => {
            const zakId = button.dataset.zakId;
            const disciplineId = button.dataset.disciplineId;
            const rocnik = button.dataset.rocnik;
            const skolniRok = button.dataset.skolniRok;

            const input = document.querySelector(`input[data-discipline-id="${disciplineId}"]`);
            const vykon = input.value;

            if (!vykon) {
                alert("Zadejte výkon!");
                return;
            }

            const data = {
                zak_id: parseInt(zakId),
                discipline_id: parseInt(disciplineId),
                rocnik: parseInt(rocnik),
                vykon: vykon,
                skolni_rok: parseInt(skolniRok)
            };

            try {
                const response = await fetch("/ulozit_vykon", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.message) {
                    alert(result.message);
                    input.classList.add("success");
                } else {
                    alert(result.error || "Chyba při ukládání.");
                }
            } catch (err) {
                console.error("❌ Chyba při volání API:", err);
                alert("Chyba při ukládání výkonu.");
            }
        });
    });

    // Přidání funkcionality pro automatické ukládání při změně vstupu
    document.querySelectorAll(".vykon-input").forEach(input => {
        input.addEventListener("change", function () {
            const zakId = this.dataset.zakId;
            const disciplineId = this.dataset.discId;
            const vykon = this.value;
            const rocnik = this.dataset.rocnik;
            const skolniRok = this.dataset.skolniRok;

            fetch("/ulozit_vykon", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    zak_id: zakId,
                    discipline_id: disciplineId,
                    vykon: vykon,
                    rocnik: rocnik,
                    skolni_rok: skolniRok
                })
            })
            .then(res => res.json())
            .then(data => {
                console.log("✅ Výkon uložen:", data);
            })
            .catch(err => console.error("❌ Chyba při ukládání výkonu:", err));
        });
    });

    const inputs = document.querySelectorAll(".vykon-input");

    inputs.forEach(input => {
        const saveHandler = async () => {
            const zakId = parseInt(input.dataset.zakId);
            const disciplineId = parseInt(input.dataset.disciplineId);
            const rocnik = parseInt(input.dataset.rocnik);
            const skolniRok = parseInt(input.dataset.skolniRok);
            const vykon = input.value.trim();

            if (!vykon) return; // nic nezapisujeme, pokud je prázdné

            const data = {
                zak_id: zakId,
                discipline_id: disciplineId,
                rocnik: rocnik,
                vykon: vykon,
                skolni_rok: skolniRok
            };

            try {
                const response = await fetch("/ulozit_vykon", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.message) {
                    input.classList.add("success");
                    input.classList.remove("error");
                    showStatus(input, "✓");
                } else {
                    input.classList.add("error");
                    showStatus(input, "✗");
                }
            } catch (error) {
                console.error("Chyba při ukládání výkonu:", error);
                input.classList.add("error");
                showStatus(input, "✗");
            }
        };

        input.addEventListener("blur", saveHandler);
        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                saveHandler();
            }
        });
    });

    document.querySelectorAll("[name^='vykon_']").forEach(input => {
        input.addEventListener("blur", async function() {
            const disciplinaId = this.dataset.disciplineId;
            const vykon = this.value.trim();
            const zakId = this.dataset.zakId;
            const rocnik = this.dataset.rocnik;
            const skolniRok = this.dataset.skolniRok;
            const bodyCell = document.getElementById("body_" + disciplinaId);

            if (vykon === "") {
                bodyCell.innerText = "0";
                updateTotalPointsAndGrade();
                updateCompletedDisciplines();
                return;
            }

            try {
                const response = await fetch("/ulozit_vykon", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        zak_id: zakId,
                        discipline_id: disciplinaId,
                        vykon: vykon,
                        rocnik: rocnik,
                        skolni_rok: skolniRok
                    })
                });

                const result = await response.json();
                if (response.ok && !result.error) {
                    bodyCell.innerText = result.body;
                    bodyCell.classList.remove("error");
                } else {
                    bodyCell.innerText = "Chyba";
                    bodyCell.classList.add("error");
                }
            } catch (err) {
                bodyCell.innerText = "Chyba";
                bodyCell.classList.add("error");
            }

            updateTotalPointsAndGrade();
            updateCompletedDisciplines();
        });

        // Enter → blur → spustí výše uvedené
        input.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                this.blur();
            }
        });

        input.addEventListener("input", updateCompletedDisciplines);
    });

    function showStatus(input, symbol) {
        const statusSpan = input.closest("tr").querySelector(".ulozit-status");
        if (statusSpan) {
            statusSpan.textContent = symbol;
            setTimeout(() => {
                statusSpan.textContent = "";
            }, 2000);
        }
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const tridaElement = document.getElementById("aktualni-trida");
    if (tridaElement && tridaElement.innerText.trim() === "Neznámá třída") {
        console.warn("⚠️ Třída žáka není definována.");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Kontrola, zda jsme na stránce detailu žáka
    if (document.getElementById('detail-zaka-page')) {
        // Získání ID žáka z formuláře
        const zakIdInput = document.querySelector('[name="zak_id"]');
        if (zakIdInput) {
            const zakId = parseInt(zakIdInput.value);
            // Získání ročníku
            const rocnikInput = document.getElementById('selectedRocnik');
            const rocnik = rocnikInput ? parseInt(rocnikInput.value) : null;
            // Získání školního roku z localStorage
            const skolniRokString = localStorage.getItem("skolniRok") || "2025/2026";
            const skolniRok = parseInt(skolniRokString.split("/")[0]);
            
            // Volání funkce pro načtení souhrnu
            if (zakId && rocnik) {
                console.log(`📊 Načítám souhrn žáka ID: ${zakId}, ročník: ${rocnik}, školní rok: ${skolniRok}`);
                getStudentSummary(zakId, rocnik, skolniRok)
                    .then(summary => {
                        if (summary) {
                            // Aktualizace UI s daty
                            updateStudentSummaryUI(summary);
                        }
                    })
                    .catch(error => {
                        console.error("❌ Chyba při načítání souhrnu žáka:", error);
                    });
            }
        }
    }
});

/**
 * Načte souhrn výkonů žáka a aktualizuje UI
 */
async function loadStudentSummary() {
    const zakId = document.querySelector("[name='zak_id']")?.value;
    const rocnik = document.getElementById("selectedRocnik")?.value || "6";
    const skolniRokString = localStorage.getItem("skolniRok") || "2025/2026";
    const skolniRok = parseInt(skolniRokString.split("/")[0]);

    if (!zakId || !rocnik || isNaN(skolniRok)) {
        console.error("❌ Chybí potřebná data pro načtení souhrnu.");
        return;
    }

    try {
        const summary = await getStudentSummary(zakId, rocnik, skolniRok);
        if (summary) {
            updateStudentSummaryUI(summary);
        }
    } catch (error) {
        console.error("❌ Chyba při načítání souhrnu žáka:", error);
    }
}