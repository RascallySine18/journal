let journalData = JSON.parse(localStorage.getItem('journal')) || [];

function addEntry() {
    const student = document.getElementById('studentName').value;
    const subject = document.getElementById('subjectName').value;

    if (student && subject) {
        journalData.push({ student, subject, grades: [] });
        saveAndRender();
        document.getElementById('studentName').value = '';
        document.getElementById('subjectName').value = '';
    }
}

function addGrade(index) {
    const grade = prompt("Введите оценку (2-5):");
    if (grade >= 2 && grade <= 5) {
        journalData[index].grades.push(parseInt(grade));
        saveAndRender();
    }
}

function calculateAverage(grades) {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((a, b) => a + b, 0);
    return (sum / grades.length).toFixed(1);
}

function getGradeClass(avg) {
    if (avg >= 4.5) return 'grade-5';
    if (avg >= 3.5) return 'grade-4';
    if (avg >= 2.5) return 'grade-3';
    if (avg > 0) return 'grade-2';
    return '';
}

function saveAndRender() {
    localStorage.setItem('journal', JSON.stringify(journalData));
    const tbody = document.getElementById('journalBody');
    tbody.innerHTML = '';

    journalData.forEach((item, index) => {
        const avg = calculateAverage(item.grades);
        const row = `
            <tr>
                <td data-label="Ученик">${item.student}</td>
                <td data-label="Предмет">${item.subject}</td>
                <td data-label="Оценки">
                    <div style="display: flex; flex-wrap: wrap; gap: 5px; justify-content: flex-end;">
                        ${item.grades.map(g => `<span class="grade-badge grade-${g}">${g}</span>`).join('')}
                        <button onclick="addGrade(${index})" style="width:35px; height:35px; padding:0">+</button>
                    </div>
                </td>
                <td data-label="Средний" class="avg-cell ${getGradeClass(avg)}">${avg > 0 ? avg : '-'}</td>
                <td data-label="Действие">
                    <button onclick="deleteEntry(${index})" style="background: rgba(255,0,0,0.3); width:35px; height:35px; padding:0">✕</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}
function deleteEntry(index) {
    journalData.splice(index, 1);
    saveAndRender();
}


saveAndRender();
