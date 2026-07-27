let moduloLengua = [];
let moduloAccesibilidad = [];
let moduloMedioFisico = [];
let moduloMarcoJuridico = [];
let quizQuestions = [];

// Variables del temporizador
let timerInterval = null;
let timeLeft = 60 * 60; // 60 minutos en segundos

// Función para normalizar preguntas (maneja el formato específico de tus JSON)
function normalizarPregunta(q, nombreModulo, colorModulo, iconoModulo) {
    const pregunta = (q["pregunta "] || q["pregunta"] || "").trim();
    const respuestas = (q["respuestas "] || q["respuestas"] || []).map(r => r.trim());
    const correctaTexto = (q["correcta "] || q["correcta"] || "").trim();
    
    // Encontrar el índice de la respuesta correcta
    const indiceCorrecta = respuestas.findIndex(r => r === correctaTexto);
    
    return {
        id: `${nombreModulo.replace(/\s/g, '_')}_${q["numero "] || q["numero"]}`,
        pregunta: pregunta,
        opciones: respuestas,
        correcta: indiceCorrecta,
        modulo: nombreModulo,
        color: colorModulo,
        icono: iconoModulo
    };
}

// Cargar los 4 archivos JSON
Promise.all([
    fetch('lengua_castellana.json').then(r => r.json()),
    fetch('accesibilidad.json').then(r => r.json()),
    fetch('medio_fisico.json').then(r => r.json()),
    fetch('marco_juridico.json').then(r => r.json())
])
.then(([dataLengua, dataAcc, dataMedio, dataMarco]) => {
    moduloLengua = dataLengua.map(q => 
        normalizarPregunta(q, 'Lengua Castellana', '#667eea', '📖')
    );
    moduloAccesibilidad = dataAcc.map(q => 
        normalizarPregunta(q, 'Accesibilidad', '#28a745', '♿')
    );
    moduloMedioFisico = dataMedio.map(q => 
        normalizarPregunta(q, 'Medio Físico', '#fd7e14', '🗺️')
    );
    moduloMarcoJuridico = dataMarco.map(q => 
        normalizarPregunta(q, 'Marco Jurídico', '#dc3545', '⚖️')
    );
    
    console.log(`✅ Lengua Castellana: ${moduloLengua.length} preguntas`);
    console.log(`✅ Accesibilidad: ${moduloAccesibilidad.length} preguntas`);
    console.log(`✅ Medio Físico: ${moduloMedioFisico.length} preguntas`);
    console.log(`✅ Marco Jurídico: ${moduloMarcoJuridico.length} preguntas`);
})
.catch(error => {
    alert('❌ Error al cargar los módulos. Verifica que los 4 archivos JSON existan en la misma carpeta.');
    console.error(error);
});

// Elementos del DOM
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');
const startBtn = document.getElementById('start-btn');
const submitBtn = document.getElementById('submit-btn');
const retryBtn = document.getElementById('retry-btn');
const questionsContainer = document.getElementById('questions-container');
const timerElement = document.getElementById('timer');

// ====== FUNCIONES DEL TEMPORIZADOR ======
function startTimer() {
    timeLeft = 60 * 60;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('⏰ ¡Se acabó el tiempo! El examen se enviará automáticamente.');
            submitQuiz();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    timerElement.textContent = display;
    
    timerElement.classList.remove('warning', 'danger');
    
    if (timeLeft <= 300) { // Menos de 5 minutos
        timerElement.classList.add('danger');
    } else if (timeLeft <= 600) { // Menos de 10 minutos
        timerElement.classList.add('warning');
    }
}

// ====== NAVEGACIÓN ENTRE PANTALLAS ======
function showScreen(screen) {
    [startScreen, quizScreen, resultsScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
    window.scrollTo(0, 0);
}

// ====== MEZCLAR ARRAY (Fisher-Yates) ======
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ====== INICIAR EXAMEN ======
startBtn.addEventListener('click', () => {
    if (moduloLengua.length < 15 || moduloAccesibilidad.length < 15 || 
        moduloMedioFisico.length < 15 || moduloMarcoJuridico.length < 15) {
        alert('⚠️ Cada módulo debe tener al menos 15 preguntas.');
        return;
    }
    
    // 15 preguntas al azar de cada módulo
    const q1 = shuffle(moduloLengua).slice(0, 15);
    const q2 = shuffle(moduloAccesibilidad).slice(0, 15);
    const q3 = shuffle(moduloMedioFisico).slice(0, 15);
    const q4 = shuffle(moduloMarcoJuridico).slice(0, 15);
    
    // Combinar y mezclar todo
    quizQuestions = shuffle([...q1, ...q2, ...q3, ...q4]);
    
    renderQuestions();
    startTimer();
    showScreen(quizScreen);
});

// ====== RENDERIZAR PREGUNTAS ======
function renderQuestions() {
    questionsContainer.innerHTML = '';
    quizQuestions.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.style.borderLeftColor = q.color;
        
        let optionsHTML = '';
        q.opciones.forEach((opt, i) => {
            optionsHTML += `
                <label class="option">
                    <input type="radio" name="q${q.id}" value="${i}">
                    <span>${opt}</span>
                </label>
            `;
        });
        
        card.innerHTML = `
            <div class="modulo-tag" style="background: ${q.color};">
                ${q.icono} ${q.modulo}
            </div>
            <h3>${index + 1}. ${q.pregunta}</h3>
            ${optionsHTML}
        `;
        questionsContainer.appendChild(card);
    });
}

// ====== CALCULAR NOTA ======
function submitQuiz() {
    stopTimer();
    
    let score = 0;
    let reviewHTML = '';
    
    const statsPorModulo = {
        'Lengua Castellana': {correctas: 0, total: 0, color: '#667eea', icono: '📖'},
        'Accesibilidad': {correctas: 0, total: 0, color: '#28a745', icono: '♿'},
        'Medio Físico': {correctas: 0, total: 0, color: '#fd7e14', icono: '🗺️'},
        'Marco Jurídico': {correctas: 0, total: 0, color: '#dc3545', icono: '⚖️'}
    };
    
    quizQuestions.forEach((q, index) => {
        const selected = document.querySelector(`input[name="q${q.id}"]:checked`);
        const userAnswer = selected ? parseInt(selected.value) : -1;
        const isCorrect = userAnswer === q.correcta;
        
        if (isCorrect) {
            score++;
            statsPorModulo[q.modulo].correctas++;
        }
        statsPorModulo[q.modulo].total++;
        
        const userText = userAnswer === -1 
            ? 'Sin responder' 
            : q.opciones[userAnswer];
        
        const correctText = q.opciones[q.correcta];
        
        reviewHTML += `
            <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}" style="border-left-color: ${q.color};">
                <div class="modulo-tag-small" style="background: ${q.color}20; color: ${q.color};">
                    ${q.icono} ${q.modulo}
                </div>
                <h4>${index + 1}. ${q.pregunta}</h4>
                <p>Tu respuesta: <span class="${isCorrect ? 'correct-answer' : 'your-answer'}">${userText}</span></p>
                ${!isCorrect ? `<p>Respuesta correcta: <span class="correct-answer">${correctText}</span></p>` : ''}
            </div>
        `;
    });
    
    // Mostrar resultados generales
    const percentage = ((score / 60) * 100).toFixed(1);
    document.getElementById('final-score').textContent = score;
    document.getElementById('percentage').textContent = `${percentage}%`;
    
    const messageEl = document.getElementById('message');
    if (percentage >= 80) {
        messageEl.textContent = '🎉 ¡Excelente trabajo!';
        messageEl.className = 'message good';
    } else if (percentage >= 60) {
        messageEl.textContent = '👍 Buen trabajo, sigue practicando.';
        messageEl.className = 'message ok';
    } else {
        messageEl.textContent = '📖 Necesitas repasar más. ¡No te rindas!';
        messageEl.className = 'message bad';
    }
    
    // Estadísticas por módulo
    let statsHTML = '<h3 style="margin-top:30px; color:#333;">📊 Desglose por Módulo:</h3>';
    for (const [modulo, stats] of Object.entries(statsPorModulo)) {
        const porcModulo = ((stats.correctas / stats.total) * 100).toFixed(0);
        statsHTML += `
            <div class="modulo-stat" style="border-left-color: ${stats.color};">
                <span><strong>${stats.icono} ${modulo}:</strong> ${stats.correctas}/${stats.total}</span>
                <span class="stat-percent" style="color: ${stats.color};">${porcModulo}%</span>
            </div>
        `;
    }
    
    document.getElementById('review-container').innerHTML = statsHTML + reviewHTML;
    showScreen(resultsScreen);
}

// Botón finalizar manualmente
submitBtn.addEventListener('click', () => {
    const unanswered = quizQuestions.filter(q => {
        return !document.querySelector(`input[name="q${q.id}"]:checked`);
    }).length;
    
    if (unanswered > 0) {
        const confirmar = window.confirm(`⚠️ Tienes ${unanswered} preguntas sin responder. ¿Deseas finalizar el examen?`);
        if (!confirmar) return;
    }
    
    submitQuiz();
});

// Reintentar
retryBtn.addEventListener('click', () => {
    showScreen(startScreen);
});