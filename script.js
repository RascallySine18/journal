let state = JSON.parse(localStorage.getItem('journal_v4')) || { subjects: [], globalStudents: [] };
let currentSubject = "";
let selectedStudentName = "";

function save() {
    localStorage.setItem('journal_v4', JSON.stringify(state));
    render();
}

function showScreen(screenId, el) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`screen-${screenId}`).classList.add('active');
    el.classList.add('active');
    render();
}

function addSubject() {
    const name = prompt("Название предмета:");
    if (name) {
        // При добавлении предмета, он просто создается. Ученики подтянутся из globalStudents при рендере.
        if (!state.subjects.find(s => s.name === name)) {
            state.subjects.push({ name, gradesData: {} }); // gradesData хранит оценки: { "Иван Иванов": [...] }
            currentSubject = name;
            save();
        }
    }
}

function addNewStudentGlobal() {
    const name = prompt("Имя и Фамилия ученика:");
    if (name && !state.globalStudents.includes(name)) {
        state.globalStudents.push(name);
        save();
    }
}

function switchSubject(val) {
    currentSubject = val;
    render();
}

// Работа с модальным окном ученика
function openStudentCard(name) {
    selectedStudentName = name;
    const subj = state.subjects.find(s => s.name === currentSubject);
    const grades = (subj.gradesData[name] || []);
    
    document.getElementById('ms-name').innerText = name;
    document.getElementById('ms-subject').innerText = currentSubject;
    
    const grid = document.getElementById('ms-grades-grid');
    grid.innerHTML = grades.map((g, idx) => `
        <div class="grade-item" style="background:${getGradeColor(g.val)}" 
             onclick="openGradeDetails(${idx})">${g.val}</div>
    `).join('');
    
    document.getElementById('studentModal').style.display = 'flex';
}

function triggerAddGrade() {
    const val = prompt("Оценка (2-5):");
    if (val >= 2 && val <= 5) {
        const comment = prompt("За что?");
        const subj = state.subjects.find(s => s.name === currentSubject);
        if (!subj.gradesData[selectedStudentName]) subj.gradesData[selectedStudentName] = [];
        
        subj.gradesData[selectedStudentName].push({
            val: parseInt(val),
            comment: comment || "Работа на уроке",
            date: new Date().toLocaleDateString('ru-RU')
        });
        save();
        openStudentCard(selectedStudentName); // Обновляем окно
    }
}

function openGradeDetails(idx) {
    const subj = state.subjects.find(s => s.name === currentSubject);
    const grade = subj.gradesData[selectedStudentName][idx];
    
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
    const select = document.getElementById('subjectSelect');
    select.innerHTML = '<option value="" disabled ' + (currentSubject ? '' : 'selected') + '>Выберите предмет</option>' + 
        state.subjects.map(s => `<option value="${s.name}" ${s.name === currentSubject ? 'selected' : ''}>${s.name}</option>`).join('');

    const content = document.getElementById('journalContent');
    const subj = state.subjects.find(s => s.name === currentSubject);
    
    if (!subj) {
        content.innerHTML = '<p style="text-align:center; opacity:0.5; margin-top:50px;">Выберите предмет</p>';
    } else {
        content.innerHTML = state.globalStudents.map(name => {
            const grades = subj.gradesData[name] || [];
            const avg = grades.length ? (grades.reduce((a,b) => a+b.val, 0)/grades.length).toFixed(1) : "-";
            return `
                <div class="student-card" onclick="openStudentCard('${name}')">
                    <div class="name-info">
                        <div style="font-size:1.1rem; font-weight:800">${name.split(' ')[0]}</div>
                        <div style="opacity:0.6; font-size:0.8rem">${name.split(' ')[1] || ''}</div>
                    </div>
                    <div class="avg-badge" style="background:${getGradeColor(avg)}">${avg}</div>
                </div>
            `;
        }).join('');
    }

    // Сводка
    const stats = document.getElementById('statsContent');
    stats.innerHTML = state.globalStudents.map(name => {
        let totalSum = 0, totalCount = 0;
        let rows = state.subjects.map(s => {
            const g = s.gradesData[name] || [];
            if (!g.length) return '';
            const a = g.reduce((acc,curr) => acc+curr.val, 0) / g.length;
            totalSum += a; totalCount++;
            return `<div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-top:5px;">
                        <span>${s.name}</span><b>${a.toFixed(1)}</b>
                    </div>`;
        }).join('');
        const totalAvg = totalCount ? (totalSum / totalCount).toFixed(2) : "-";
        return `<div class="student-card" style="flex-direction:column; align-items:stretch;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <b>${name}</b> <span style="color:${getGradeColor(totalAvg)}">${totalAvg}</span>
                    </div>
                    ${rows}
                </div>`;
    }).join('');
}

render();
