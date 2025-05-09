chrome.storage.sync.get(['minGrade', 'maxGrade', 'saveGrades'], (data) => {
    if (data.saveGrades && data.minGrade && data.maxGrade) {
        const minGrade = data.minGrade;
        const maxGrade = data.maxGrade;

        function generateRandomGrade(min, max) {
            return (Math.random() * (max - min) + min).toFixed(1);
        }

        // Überprüfe, ob die Tabelle existiert
        const tableCells = document.querySelectorAll('td');
        if (tableCells.length === 0) {
            console.warn('Keine Tabellenzellen gefunden. Überprüfe den Selektor.');
            return;
        }

        // Ändere die Noten in den Tabellenzellen
        tableCells.forEach(td => {
            const firstChild = td.childNodes[0];
            if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
                const gradeText = firstChild.nodeValue.trim();
                if (!isNaN(gradeText) && gradeText.length > 0) {
                    const newGrade = generateRandomGrade(minGrade, maxGrade);
                    firstChild.nodeValue = newGrade + '00'; // Anhängen von '00' als String
                }
            }
        });

        console.log('Noten wurden automatisch geändert.');
    } else {
        console.log('Speichern der Noten ist deaktiviert oder keine Werte vorhanden.');
    }
});