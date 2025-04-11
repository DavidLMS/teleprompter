document.addEventListener('DOMContentLoaded', () => {
    // --- Selectores (sin cambios) ---
    const scriptInput = document.getElementById('scriptInput');
    const teleprompterDisplay = document.getElementById('teleprompterDisplay');
    const teleprompterWrapper = document.getElementById('teleprompterDisplayWrapper');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const speedControl = document.getElementById('speedControl');
    const speedValueSpan = document.getElementById('speedValue');
    const fontSizeControl = document.getElementById('fontSizeControl');
    const fontSizeValueSpan = document.getElementById('fontSizeValue');
    // ---- NUEVO: Selector para el contenedor principal y los controles ----
    const teleprompterContainer = document.querySelector('.teleprompter-container');
    const controlsElement = document.querySelector('.controls');
    // ---- FIN NUEVO ----

    // --- Variables de estado (sin cambios) ---
    let isPlaying = false;
    let scrollInterval = null;
    let currentSpeed = parseInt(speedControl.value, 10);
    let scrollPosition = 0;
    const INTERVAL_DELAY = 50;

    // --- NUEVA FUNCIÓN: Ajustar Layout ---
    function adjustLayout() {
        if (!controlsElement || !teleprompterContainer) return; // Seguridad

        const controlsHeight = controlsElement.offsetHeight;
        console.log("Control bar height:", controlsHeight); // Para depuración
        teleprompterContainer.style.paddingTop = `${controlsHeight}px`;

        // Opcional: Podrías ajustar dinámicamente la altura del wrapper si flex-grow da problemas
        // const availableHeight = window.innerHeight - controlsHeight;
        // const scriptInputHeight = scriptInput.offsetHeight;
        // const scriptInputMargin = (scriptInput.style.display !== 'none' ? 20 : 0); // Aprox margin top+bottom
        // const wrapperMarginBottom = 10; // Margen inferior implícito o explícito
        // teleprompterWrapper.style.height = `${availableHeight - scriptInputHeight - scriptInputMargin - wrapperMarginBottom}px`;
        // console.log("Calculated wrapper height:", teleprompterWrapper.style.height); // Depuración
    }
    // --- FIN NUEVA FUNCIÓN ---

    // --- Event Listeners (Modificados/Añadidos) ---

    // Cargar Texto (sin cambios en la lógica interna)
    scriptInput.addEventListener('input', () => {
        teleprompterDisplay.innerHTML = scriptInput.value.replace(/\n/g, '<br>');
        if (isPlaying) {
            stopScroll();
        } else {
             teleprompterDisplay.scrollTop = 0;
             scrollPosition = 0;
        }
        // Podríamos llamar a adjustLayout() aquí si el contenido del textarea afectase la altura de controles (poco probable)
    });

    // Controles de Reproducción (sin cambios internos)
    playPauseBtn.addEventListener('click', () => { if (isPlaying) pauseScroll(); else startScroll(); });
    stopBtn.addEventListener('click', stopScroll);

    // Controles de Velocidad y Tamaño (sin cambios)
    speedControl.addEventListener('input', () => { /* ... */ });
    fontSizeControl.addEventListener('input', () => { /* ... */ });

    // Scroll y Click en Display (sin cambios)
    teleprompterDisplay.addEventListener('scroll', () => { /* ... */ });
    teleprompterDisplay.addEventListener('click', (event) => { /* ... */ });

    // --- NUEVO: Listener para resize ---
    window.addEventListener('resize', adjustLayout);
    // --- FIN NUEVO ---


    // --- Funciones Auxiliares (Modificadas para llamar a adjustLayout) ---
    function startScroll() {
        if (teleprompterDisplay.innerHTML.trim() === '') return;
        isPlaying = true;
        playPauseBtn.textContent = 'Pause';
        playPauseBtn.classList.add('playing');
        scriptInput.disabled = true;
        teleprompterDisplay.contentEditable = 'false';
        teleprompterDisplay.style.scrollBehavior = 'auto';
        scriptInput.style.display = 'none'; // Ocultar textarea
        adjustLayout(); // <<-- AJUSTAR LAYOUT AL OCULTAR TEXTAREA

        teleprompterDisplay.scrollTop = scrollPosition;
        if (scrollInterval) clearInterval(scrollInterval);
        scrollInterval = setInterval(() => {
            // ... (lógica de scroll sin cambios) ...
            const scrollAmount = currentSpeed * 0.5;
            teleprompterDisplay.scrollTop += scrollAmount;
            scrollPosition = teleprompterDisplay.scrollTop;
            if (teleprompterDisplay.scrollTop + teleprompterDisplay.clientHeight >= teleprompterDisplay.scrollHeight - 5) {
                stopScroll();
            }
        }, INTERVAL_DELAY);
    }

    function pauseScroll() {
        isPlaying = false;
        playPauseBtn.textContent = 'Play';
        playPauseBtn.classList.remove('playing');
        scriptInput.disabled = false;
        teleprompterDisplay.style.scrollBehavior = 'smooth';
        scriptInput.style.display = 'block'; // Mostrar textarea
        adjustLayout(); // <<-- AJUSTAR LAYOUT AL MOSTRAR TEXTAREA

        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
        scrollPosition = teleprompterDisplay.scrollTop;
    }

    function stopScroll() {
        pauseScroll();
        teleprompterDisplay.scrollTop = 0;
        scrollPosition = 0;
        // adjustLayout() ya se llama en pauseScroll
    }

    // --- Inicialización ---
    speedValueSpan.textContent = speedControl.value;
    fontSizeValueSpan.textContent = `${fontSizeControl.value}px`;
    teleprompterDisplay.style.fontSize = `${fontSizeControl.value}px`;
    if (scriptInput.value) {
         teleprompterDisplay.innerHTML = scriptInput.value.replace(/\n/g, '<br>');
    }
    scriptInput.style.display = 'block';
    // --- NUEVO: Llamada inicial para ajustar layout ---
    adjustLayout();
    // Pequeño delay por si las fuentes o algo tarda en renderizar y afecta la altura inicial
    setTimeout(adjustLayout, 100);
    // --- FIN NUEVO ---

});