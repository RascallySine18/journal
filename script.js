// Инициализация базы данных
let db = JSON.parse(localStorage.getItem('journal_db_v5')) || {
    subjects: [], // Список названий предметов
    students: [], // Глобальный список учеников ["Иванов", "Петров"]
    grades: {}    // Оценки в формате { "Предмет": { "Ученик": [ {val, comment, date} ] } }
};

let currentSubject = "";
let selectedStudent = "";

function save() {
    localStorage.setItem('journal_db_v5', JSON.stringify(db));
    render();
}

function showScreen(id, el) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`screen-${id}`).classList.add('active');
    el.classList.add('active');
    render();
}

// Управление данными
function addSubject() {
    const name = prompt("Название предмета:");
    if (name && !db.subjects.includes(name)) {
        db.subjects.push(name);
        db.grades[name] = {};
        currentSubject = name;
        save();
    }
}

function addGlobalStudent() {
    const name = prompt("Фамилия и Имя ученика:");
    if (name && !db.students.includes(name)) {
        db.students.push(name);
        save();
    }
}

function switchSubject(val) {
    currentSubject = val;
    render();
}

// Модалка ученика
function openStudentCard(name) {
    selectedStudent = name;
    document.getElementById('ms-name').innerText = name;
    document.getElementById('ms-subject').innerText = currentSubject;
    
    const gradesList = (db.grades[currentSubject] && db.grades[currentSubject][name]) || [];
    const grid = document.getElementById('ms-grades-grid');
    
    grid.innerHTML = gradesList.map((g, idx) => `
        <div class="grade-item" style="background:${getGradeColor(g.val)}" 
             onclick="showGradeDetail(${idx})">${g.val}</div>
    `).join('');
    
    document.getElementById('studentModal').style.display = 'flex';
}

function openAddGradePrompt() {
    const val = prompt("Введите оценку (2-5):");
    if (val >= 2 && val <= 5) {
        const comment = prompt("За что оценка?");
        if (!db.grades[currentSubject]) db.grades[currentSubject] = {};
        if (!db.grades[currentSubject][selectedStudent]) db.grades[currentSubject][selectedStudent] = [];
        
        db.grades[currentSubject][selectedStudent].push({
            val: parseInt(val),
            comment: comment || "Работа на уроке",
            date: new Date().toLocaleDateString('ru-RU')
        });
        save();
        openStudentCard(selectedStudent); // Перерисовать список оценок
    }
}

function showGradeDetail(idx) {
    const grade = db.grades[currentSubject][selectedStudent][idx];
    document.getElementById('mg-val').innerText = grade.val;
    document.getElementById('mg-val').style.background = getGradeColor(grade.val);
    document.getElementById('mg-comment').innerText = grade.comment;
    document.getElementById('mg-date').innerText = `Дата: ${grade.date}`;
    document.getElementById('gradeModal').style.display = 'flex';
}

function closeStudentModal() { document.getElementById('studentModal').style.display = 'none'; }
function closeGradeModal() { document.getElementById('gradeModal').style.display = 'none'; }

function getGradeColor(v) {
    if (v >= 4.5) return 'var(--g5)';
    if (v >= 3.5) return 'var(--g4)';
    if (v >= 2.5) return 'var(--g3)';
    if (v > 0) return 'var(--g2)';
    return 'rgba(255,255,255,0.1)';
}

function render() {
    // Рендер выбора предмета
    const select = document.getElementById('subjectSelect');
    select.innerHTML = '<option value="" disabled ' + (currentSubject ? '' : 'selected') + '>Выберите предмет</option>' + 
        db.subjects.map(s => `<option value="${s}" ${s === currentSubject ? 'selected' : ''}>${s}</option>`).join('');

    const content = document.getElementById('journalContent');
    if (!currentSubject) {
        content.innerHTML = '<div style="text-align:center; opacity:0.4; margin-top:50px;">Выберите предмет</div>';
    } else {
        // Рендер списка учеников
        content.innerHTML = db.students.map(name => {
            const grades = (db.grades[currentSubject] && db.grades[currentSubject][name]) || [];
            const avg = grades.length ? (grades.reduce((a,b) => a+b.val, 0)/grades.length).toFixed(1) : "-";
            return `
                <div class="student-card" onclick="openStudentCard('${name}')">
                    <div style="font-weight:600">${name}</div>
                    <div class="avg-badge" style="background:${getGradeColor(avg)}">${avg}</div>
                </div>
            `;
        }).join('');
    }

    // Рендер сводки
    const stats = document.getElementById('statsContent');
    stats.innerHTML = db.students.map(name => {
        let totalSum = 0, count = 0;
        const subjsHtml = db.subjects.map(s => {
            const g = (db.grades[s] && db.grades[s][name]) || [];
            if (!g.length) return '';
            const a = g.reduce((acc, v) => acc + v.val, 0) / g.length;
            totalSum += a; count++;
            return `<div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-top:5px;opacity:0.8">
                        <span>${s}</span><b>${a.toFixed(1)}</b>
                    </div>`;
        }).join('');
        const finalAvg = count ? (totalSum / count).toFixed(2) : "-";
        return `
            <div class="student-card" style="flex-direction:column; align-items:stretch">
                <div style="display:flex;justify-content:space-between;font-weight:800;font-size:1.1rem">
                    <span>${name}</span><span style="color:${getGradeColor(finalAvg)}">${finalAvg}</span>
                </div>
                ${subjsHtml}
            </div>
        `;
    }).join('');
}

render();
