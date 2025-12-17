let state = JSON.parse(localStorage.getItem('journal_v3')) || { subjects: [] };
let currentSubject = "";

// Сохранение и обновление интерфейса
function save() {
    localStorage.setItem('journal_v3', JSON.stringify(state));
    render();
}

// Переключение экранов
function showScreen(screenId, el) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`screen-${screenId}`).classList.add('active');
    el.classList.add('active');
    render();
}

// Управление предметами
function addSubject() {
    const name = prompt("Название предмета (например, Математика):");
    if (name) {
        state.subjects.push({ name, students: [] });
        currentSubject = name;
        save();
    }
}

function switchSubject(val) {
    currentSubject = val;
    render();
}

// Управление учениками
function addStudent() {
    if (!currentSubject) return alert("Сначала выберите или создайте предмет!");
    const name = prompt("Имя и фамилия ученика:");
    if (name) {
        const subj = state.subjects.find(s => s.name === currentSubject);
        subj.students.push({ name, grades: [] });
        save();
    }
}

// Управление оценками
function addGrade(stuName) {
    const val = prompt("Введите оценку (2-5):");
    if (val >= 2 && val <= 5) {
        const comment = prompt("За какое задание? (н-р: Контрольная работа)");
        const subj = state.subjects.find(s => s.name === currentSubject);
        const stu = subj.students.find(s => s.name === stuName);
        stu.grades.push({
            val: parseInt(val),
            comment: comment || "Работа в классе",
            date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
        });
        save();
    }
}

// Детали оценки (Модалка)
function openDetails(val, comment, date) {
    const modal = document.getElementById('modal');
    const mGrade = document.getElementById('m-grade');
    mGrade.innerText = val;
    mGrade.style.background = getGradeColor(val);
    document.getElementById('m-comment').innerText = comment;
    document.getElementById('m-date').innerText = `Выставлено: ${date}`;
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Вспомогательные функции
function getGradeColor(v) {
    if (v >= 4.5) return 'var(--g5)';
    if (v >= 3.5) return 'var(--g4)';
    if (v >= 2.5) return 'var(--g3)';
    if (v > 0) return 'var(--g2)';
    return 'transparent';
}

function render() {
    // 1. Селект предметов
    const select = document.getElementById('subjectSelect');
    select.innerHTML = '<option value="" disabled ' + (currentSubject ? '' : 'selected') + '>Выберите предмет</option>' + 
        state.subjects.map(s => `<option value="${s.name}" ${s.name === currentSubject ? 'selected' : ''}>${s.name}</option>`).join('');

    // 2. Список учеников в журнале
    const content = document.getElementById('journalContent');
    const activeSubj = state.subjects.find(s => s.name === currentSubject);
    
    if (!activeSubj) {
        content.innerHTML = '<div style="text-align:center; opacity:0.4; margin-top:60px;">Создайте предмет, чтобы начать</div>';
    } else {
        content.innerHTML = activeSubj.students.map(stu => {
            const sum = stu.grades.reduce((a, b) => a + b.val, 0);
            const avg = stu.grades.length ? (sum / stu.grades.length).toFixed(1) : "-";
            return `
                <div class="student-row">
                    <div class="name-info">${stu.name}</div>
                    <div class="grades-wrapper">
                        <div class="grades-scroll">
                            ${stu.grades.map(g => `
                                <div class="grade-badge" style="background:${getGradeColor(g.val)}" 
                                     onclick="openDetails(${g.val}, '${g.comment}', '${g.date}')">
                                     ${g.val}
                                </div>
                            `).join('')}
                        </div>
                        <div class="add-grade-btn" onclick="addGrade('${stu.name}')">+</div>
                    </div>
                    <div class="avg-box" style="color:${getGradeColor(avg)}">${avg}</div>
                </div>
            `;
        }).join('');
    }

    // 3. Сводка (Статистика)
    const statsContent = document.getElementById('statsContent');
    const studentStats = {};

    state.subjects.forEach(subj => {
        subj.students.forEach(stu => {
            if (!studentStats[stu.name]) studentStats[stu.name] = [];
            if (stu.grades.length) {
                const avg = stu.grades.reduce((a,b) => a+b.val,0) / stu.grades.length;
                studentStats[stu.name].push({ subject: subj.name, avg: avg });
            }
        });
    });

    statsContent.innerHTML = Object.entries(studentStats).map(([name, subjs]) => {
        const totalAvg = (subjs.reduce((a,b) => a+b.avg, 0) / subjs.length).toFixed(2);
        return `
            <div class="stats-card">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0">${name}</h3>
                    <span style="font-size:1.2rem; font-weight:800; color:${getGradeColor(totalAvg)}">${totalAvg}</span>
                </div>
                <div class="glass-hr" style="margin:10px 0"></div>
                ${subjs.map(s => `
                    <div class="subj-row">
                        <span>${s.subject}</span>
                        <span style="font-weight:bold">${s.avg.toFixed(1)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

// Старт
render();
