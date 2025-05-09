document.addEventListener('DOMContentLoaded', () => {
    const fromSlider = document.getElementById('fromSlider');
    const toSlider = document.getElementById('toSlider');
    const fromInput = document.getElementById('fromInput');
    const toInput = document.getElementById('toInput');
    const changeGradesButton = document.getElementById('change-grades');
    const saveGradesCheckbox = document.getElementById('save-grades');

    // Synchronisiere Slider und Eingabefelder
    function syncFromSlider(value) {
        fromSlider.value = value;
        fromInput.value = value;
    }

    function syncToSlider(value) {
        toSlider.value = value;
        toInput.value = value;
    }

    fromSlider.addEventListener('input', () => syncFromSlider(fromSlider.value));
    fromInput.addEventListener('input', () => syncFromSlider(fromInput.value));

    toSlider.addEventListener('input', () => syncToSlider(toSlider.value));
    toInput.addEventListener('input', () => syncToSlider(toInput.value));

    // Lade gespeicherte Einstellungen
    chrome.storage.sync.get(['minGrade', 'maxGrade', 'saveGrades'], (data) => {
        if (data.minGrade) syncFromSlider(data.minGrade);
        if (data.maxGrade) syncToSlider(data.maxGrade);
        if (data.saveGrades) saveGradesCheckbox.checked = data.saveGrades;
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const url = new URL(currentTab.url);

        // Überprüfen, ob die URL zu schulnetz.lu.ch gehört
        if (!url.hostname.endsWith('schulnetz.lu.ch')) {
            const errorMessage = document.getElementById('error-message');
            errorMessage.style.display = 'block'; // Fehlermeldung anzeigen
            changeGradesButton.disabled = true; // Button deaktivieren
            return;
        }

        // Event Listener für den Button hinzufügen, wenn die Seite korrekt ist
        changeGradesButton.addEventListener('click', () => {
            const minGrade = parseFloat(fromSlider.value);
            const maxGrade = parseFloat(toSlider.value);

            // Überprüfen, ob die Werte korrekt sind
            if (minGrade >= maxGrade) {
                alert('Der minimale Wert muss kleiner als der maximale Wert sein.');
                return;
            }

            // Speichere die Einstellungen, wenn die Checkbox aktiviert ist
            if (saveGradesCheckbox.checked) {
                chrome.storage.sync.set({
                    minGrade: minGrade,
                    maxGrade: maxGrade,
                    saveGrades: true
                }, () => {
                    console.log('Notenbereich gespeichert:', { minGrade, maxGrade });
                });
            } else {
                chrome.storage.sync.set({ saveGrades: false }, () => {
                    console.log('Speichern der Noten deaktiviert.');
                });
            }

            chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                args: [minGrade, maxGrade],
                function: (min, max) => {
                    console.log('Script gestartet mit Range:', min, max);

                    function generateRandomGrade(min, max) {
                        return (Math.random() * (max - min) + min).toFixed(1);
                    }

                    document.querySelectorAll('td').forEach(td => {
                        const firstChild = td.childNodes[0];
                        if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
                            const gradeText = firstChild.nodeValue.trim();
                            if (!isNaN(gradeText) && gradeText.length > 0) {
                                const newGrade = generateRandomGrade(min, max);
                                firstChild.nodeValue = newGrade + '00'; // Anhängen von '00' als String
                            }
                        }
                    });
                }
            });
        });
    });
});
