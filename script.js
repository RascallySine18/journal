let data = JSON.parse(localStorage.getItem('journal_v2')) || [];
let currentSubjIndex = null;

function save() {
    localStorage.setItem('journal_v2', JSON.stringify(data));
    renderSubjects();
    renderMain();
}

function addSubject() {
    const name = prompt("Название предмета:");
    if (name) {
        data.push({ name, students: [] });
        save();
    }
}

function addStudent() {
    const name = prompt("Имя ученика:");
    if (name) {
        data[currentSubjIndex].students.push({ name, grades: [] });
        save();
    }
}

function addGrade(stuIndex) {
    const val = prompt("Оценка (2-5):");
    if (val >= 2 && val <= 5) {
        const comment = prompt("За что оценка (н-р: Контрольная работа):");
        const date = new Date().toLocaleDateString();
        data[currentSubjIndex].students[stuIndex].grades.push({
            val: parseInt(val),
            comment: comment || "Без описания",
            date: date
        });
        save();
    }
}

function showDetails(stuIdx, gradeIdx) {
    const grade = data[currentSubjIndex].students[stuIdx].grades[gradeIdx];
    document.getElementById('modalTitle').innerText = `Оценка: ${grade.val}`;
    document.getElementById('modalDate').innerText = `Дата: ${grade.date}`;
    document.getElementById('modalComment').innerText = `Задание: ${grade.comment}`;
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function renderSubjects() {
    const container = document.getElementById('subjectsList');
    container.innerHTML = data.map((s, i) => `
        <div class="subject-item ${i === currentSubjIndex ? 'active' : ''}" onclick="selectSubject(${i})">
            ${s.name}
        </div>
    `).join('');
}

function selectSubject(index) {
    currentSubjIndex = index;
    document.getElementById('subjectActions').style.display = 'block';
    save();
}

function renderMain() {
    const tbody = document.getElementById('journalBody');
    if (currentSubjIndex === null) {
        tbody.innerHTML = '<tr><td colspan="3">Выберите предмет слева</td></tr>';
        return;
    }

    const subj = data[currentSubjIndex];
    document.getElementById('currentSubjectName').innerText = subj.name;

    tbody.innerHTML = subj.students.map((stu, sIdx) => {
        const avg = stu.grades.length ? (stu.grades.reduce((a,b) => a + b.val, 0) / stu.grades.length).toFixed(1) : 0;
        return `
            <tr>
                <td><b>${stu.name}</b></td>
                <td>
                    ${stu.grades.map((g, gIdx) => `
                        <span class="grade-badge g-${g.val}" onclick="showDetails(${sIdx}, ${gIdx})">${g.val}</span>
                    `).join('')}
                    <button onclick="addGrade(${sIdx})">+</button>
                </td>
                <td>${avg > 0 ? avg : '-'}</td>
            </tr>
        `;
    }).join('');
}

// Инициализация
renderSubjects();
renderMain();
