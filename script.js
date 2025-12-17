let state = JSON.parse(localStorage.getItem('journal_v3')) || { subjects: [] };
let currentSubject = "";

function save() {
    localStorage.setItem('journal_v3', JSON.stringify(state));
    render();
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`screen-${screenId}`).classList.add('active');
    event.currentTarget.classList.add('active');
    render();
}

function addSubject() {
    const name = prompt("Название предмета:");
    if (name) {
        state.subjects.push({ name, students: [] });
        save();
    }
}

function addStudent() {
    if (!currentSubject) return alert("Сначала выберите предмет");
    const name = prompt("Имя ученика:");
    if (name) {
        const subj = state.subjects.find(s => s.name === currentSubject);
        subj.students.push({ name, grades: [] });
        save();
    }
}

function addGrade(stuName) {
    const val = prompt("Оценка (2-5):");
    if (val >= 2 && val <= 5) {
        const comment = prompt("За что оценка?");
        const subj = state.subjects.find(s => s.name === currentSubject);
        const stu = subj.students.find(s => s.name === stuName);
        stu.grades.push({ val: parseInt(val), comment, date: new Date().toLocaleDateString() });
        save();
    }
}

function switchSubject(val) {
    currentSubject = val;
    render();
}

function getGradeColor(v) {
    if (v >= 4.5) return 'var(--g5)';
    if (v >= 3.5) return 'var(--g4)';
    if (v >= 2.5) return 'var(--g3)';
    return 'var(--g2)';
}

function render() {
    // Рендер выпадающего списка
    const select = document.getElementById('subjectSelect');
    const prevVal = select.value;
    select.innerHTML = state.subjects.map(s => `<option value="${s.name}" ${s.name === currentSubject ? 'selected' : ''}>${s.name}</option>`).join('');
    
    // Рендер основного журнала
    const content = document.getElementById('journalContent');
    const activeSubj = state.subjects.find(s => s.name === currentSubject);
    
    if (activeSubj) {
        content.innerHTML = activeSubj.students.map(stu => {
            const avg = stu.grades.length ? (stu.grades.reduce((a,b) => a+b.val, 0)/stu.grades.length).toFixed(1) : "-";
            return `
                <div class="student-row glass">
                    <div class="name-info">${stu.name}</div>
                    <div class="grades-container">
                        ${stu.grades.map(g => `<div class="grade-badge" style="background:${getGradeColor(g.val)}" onclick="alert('${g.date}: ${g.comment}')">${g.val}</div>`).join('')}
                        <div class="grade-badge" style="background:var(--glass-heavy); cursor:pointer" onclick="addGrade('${stu.name}')">+</div>
                    </div>
                    <div class="avg-box" style="color:${getGradeColor(avg)}">${avg}</div>
                </div>
            `;
        }).join('');
    }

    // Рендер сводки
    const statsContent = document.getElementById('statsContent');
    const allStudents = {};
    state.subjects.forEach(subj => {
        subj.students.forEach(stu => {
            if (!allStudents[stu.name]) allStudents[stu.name] = [];
            const avg = stu.grades.length ? (stu.grades.reduce((a,b) => a+b.val, 0)/stu.grades.length) : null;
            if (avg) allStudents[stu.name].push({ subj: subj.name, score: avg });
        });
    });

    statsContent.innerHTML = Object.entries(allStudents).map(([name, subjs]) => {
        const totalAvg = (subjs.reduce((a,b) => a+b.score, 0)/subjs.length).toFixed(2);
        return `
            <div class="stats-card glass">
                <h3>${name} — <span style="color:${getGradeColor(totalAvg)}">${totalAvg}</span></h3>
                ${subjs.map(s => `<div class="subj-stat-row"><span>${s.subj}</span> <b>${s.score.toFixed(1)}</b></div>`).join('')}
            </div>
        `;
    }).join('');
}

render();
