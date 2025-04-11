document.addEventListener('DOMContentLoaded', () => {
    const scriptInput = document.getElementById('scriptInput');
    const teleprompterDisplay = document.getElementById('teleprompterDisplay');
    const teleprompterWrapper = document.getElementById('teleprompterDisplayWrapper');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const speedControl = document.getElementById('speedControl');
    const speedValueSpan = document.getElementById('speedValue');
    const fontSizeControl = document.getElementById('fontSizeControl');
    const fontSizeValueSpan = document.getElementById('fontSizeValue');

    let isPlaying = false;
    let scrollInterval = null;
    let currentSpeed = parseInt(speedControl.value, 10); // Velocidad base pixels por intervalo
    let scrollPosition = 0; // Guardar posición al pausar o hacer scroll manual
    const INTERVAL_DELAY = 50; // Milisegundos entre cada paso de scroll (más bajo = más suave)

    // --- Cargar Texto ---
    scriptInput.addEventListener('input', () => {
        teleprompterDisplay.innerHTML = scriptInput.value.replace(/\n/g, '<br>');
        if (isPlaying) {
            stopScroll();
        } else {
             teleprompterDisplay.scrollTop = 0;
             scrollPosition = 0;
        }
    });

    // --- Controles de Reproducción ---
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseScroll();
        } else {
            startScroll();
        }
    });

    stopBtn.addEventListener('click', () => {
        stopScroll();
    });

    // --- Control de Velocidad ---
    speedControl.addEventListener('input', () => {
        currentSpeed = parseInt(speedControl.value, 10);
        speedValueSpan.textContent = currentSpeed;
    });

    // --- Control de Tamaño de Texto ---
    fontSizeControl.addEventListener('input', () => {
        const newSize = fontSizeControl.value;
        teleprompterDisplay.style.fontSize = `${newSize}px`;
        fontSizeValueSpan.textContent = `${newSize}px`;
    });

    // --- Permitir seleccionar punto de inicio con scroll manual ---
    teleprompterDisplay.addEventListener('scroll', () => {
        if (!isPlaying) {
            scrollPosition = teleprompterDisplay.scrollTop;
        }
    });
     // --- Permitir seleccionar punto de inicio con click ---
     teleprompterDisplay.addEventListener('click', (event) => {
        if (!isPlaying) {
             const clickY = event.clientY - teleprompterWrapper.getBoundingClientRect().top;
             const displayHeight = teleprompterWrapper.clientHeight;
             const targetScroll = teleprompterDisplay.scrollTop + clickY - (displayHeight * 0.40);
             teleprompterDisplay.scrollTop = Math.max(0, targetScroll);
             scrollPosition = teleprompterDisplay.scrollTop;
             console.log("Nuevo punto de inicio fijado por click:", scrollPosition);
        }
    });


    // --- Funciones Auxiliares ---
    function startScroll() {
        if (teleprompterDisplay.innerHTML.trim() === '') return;

        isPlaying = true;
        playPauseBtn.textContent = 'Pause';
        playPauseBtn.classList.add('playing');
        scriptInput.disabled = true;
        teleprompterDisplay.contentEditable = 'false';
        teleprompterDisplay.style.scrollBehavior = 'auto';

        // ---- MODIFICADO: Ocultar textarea ----
        scriptInput.style.display = 'none';
        // ---- FIN MODIFICADO ----

        teleprompterDisplay.scrollTop = scrollPosition;

        if (scrollInterval) clearInterval(scrollInterval);

        scrollInterval = setInterval(() => {
            const scrollAmount = currentSpeed * 0.5;
            teleprompterDisplay.scrollTop += scrollAmount;
            scrollPosition = teleprompterDisplay.scrollTop;

            if (teleprompterDisplay.scrollTop + teleprompterDisplay.clientHeight >= teleprompterDisplay.scrollHeight - 5) {
                stopScroll();
                console.log("Llegó al final");
            }
        }, INTERVAL_DELAY);
    }

    function pauseScroll() {
        isPlaying = false;
        playPauseBtn.textContent = 'Play';
        playPauseBtn.classList.remove('playing');
        scriptInput.disabled = false;
        teleprompterDisplay.style.scrollBehavior = 'smooth';

        // ---- MODIFICADO: Mostrar textarea ----
        scriptInput.style.display = 'block'; // O el display original que tuviera
        // ---- FIN MODIFICADO ----

        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
        scrollPosition = teleprompterDisplay.scrollTop;
        console.log("Pausado en:", scrollPosition);
    }

    function stopScroll() {
        pauseScroll(); // Llama a pause, que ya se encarga de mostrar el textarea
        teleprompterDisplay.scrollTop = 0;
        scrollPosition = 0;
        console.log("Detenido y reseteado");
    }

    // --- Inicialización ---
    speedValueSpan.textContent = speedControl.value;
    fontSizeValueSpan.textContent = `${fontSizeControl.value}px`;
    teleprompterDisplay.style.fontSize = `${fontSizeControl.value}px`;
    if (scriptInput.value) {
         teleprompterDisplay.innerHTML = scriptInput.value.replace(/\n/g, '<br>');
    }
    // Asegurarse de que el textarea está visible al inicio (aunque CSS debería hacerlo)
    scriptInput.style.display = 'block';

});