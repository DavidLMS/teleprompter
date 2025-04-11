document.addEventListener('DOMContentLoaded', () => {
    // --- Selectores ---
    const scriptInput = document.getElementById('scriptInput');
    const teleprompterDisplay = document.getElementById('teleprompterDisplay');
    const teleprompterWrapper = document.getElementById('teleprompterDisplayWrapper');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const speedControl = document.getElementById('speedControl');
    const speedValueSpan = document.getElementById('speedValue');
    const fontSizeControl = document.getElementById('fontSizeControl');
    const fontSizeValueSpan = document.getElementById('fontSizeValue');
    const teleprompterContainer = document.querySelector('.teleprompter-container');
    const controlsElement = document.querySelector('.controls');

    // --- Verificación inicial de elementos críticos ---
    if (!scriptInput || !teleprompterDisplay || !playPauseBtn || !stopBtn || !speedControl || !fontSizeControl || !teleprompterContainer || !controlsElement) {
        console.error("Error crítico: Uno o más elementos esenciales del DOM no se encontraron.");
        alert("Error al cargar la página. Faltan elementos esenciales."); // Aviso al usuario
        return; // Detener ejecución
    }

    // --- Variables de estado ---
    let isPlaying = false;
    let scrollInterval = null;
    let currentSpeed = 5; // Default speed
    let scrollPosition = 0;
    const INTERVAL_DELAY = 50;

    // --- FUNCIÓN CLAVE: Ajustar Layout usando VisualViewport ---
    function adjustLayout() {
        // Sin cambios en esta función
        const controlsHeight = controlsElement.offsetHeight;
        const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        const viewportOffsetTop = window.visualViewport ? window.visualViewport.offsetTop : 0;

        teleprompterContainer.style.height = `${viewportHeight}px`;
        teleprompterContainer.style.paddingTop = `${controlsHeight}px`;
        teleprompterContainer.style.top = `${viewportOffsetTop}px`;

        console.log(`Layout Adjusted: VP Height=${viewportHeight}, Controls Height=${controlsHeight}, VP OffsetTop=${viewportOffsetTop}`);
    }

    // --- Event Listeners ---

    // Cargar Texto
    scriptInput.addEventListener('input', () => {
        teleprompterDisplay.innerHTML = scriptInput.value.replace(/\n/g, '<br>');
        if (isPlaying) {
            stopScroll();
        } else {
             teleprompterDisplay.scrollTop = 0;
             scrollPosition = 0;
        }
    });

    // --- VERIFICADO Y CON LOGGING: Control de Velocidad ---
    speedControl.addEventListener('input', () => {
        try {
            currentSpeed = parseInt(speedControl.value, 10);
            // Asegurarse que currentSpeed es un número válido
            if (isNaN(currentSpeed)) {
                console.warn("Speed control returned NaN, defaulting to 5.");
                currentSpeed = 5; // Valor por defecto si falla
                speedControl.value = 5; // Resetear slider visualmente
            }

            // Actualizar el span si existe
            if (speedValueSpan) {
                speedValueSpan.textContent = currentSpeed;
            } else {
                 console.warn("speedValueSpan element not found.");
            }
            console.log('Speed changed. New currentSpeed:', currentSpeed);

            // Si está en play, el intervalo recogerá el nuevo valor en su próximo ciclo.
            // No necesitamos reiniciar el intervalo aquí.

        } catch (error) {
            console.error("Error in speed control listener:", error);
        }
    });

    // --- VERIFICADO Y CON LOGGING: Control de Tamaño de Texto ---
    fontSizeControl.addEventListener('input', () => {
         try {
            const newSize = fontSizeControl.value;
            // Aplicar el estilo directamente al display
            teleprompterDisplay.style.fontSize = `${newSize}px`;

            // Actualizar el span si existe
            if (fontSizeValueSpan) {
                 fontSizeValueSpan.textContent = `${newSize}px`;
            } else {
                console.warn("fontSizeValueSpan element not found.");
            }
            console.log('Font size changed. New size:', newSize + 'px');

        } catch (error) {
             console.error("Error in font size control listener:", error);
        }
    });

    // Controles de Reproducción
    playPauseBtn.addEventListener('click', () => { if (isPlaying) pauseScroll(); else startScroll(); });
    stopBtn.addEventListener('click', stopScroll);

    // Scroll y Click en Display
    teleprompterDisplay.addEventListener('scroll', () => { if (!isPlaying) scrollPosition = teleprompterDisplay.scrollTop; });
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

    // --- Listeners para VisualViewport y fallback ---
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', adjustLayout);
        window.visualViewport.addEventListener('scroll', adjustLayout);
    } else {
        window.addEventListener('resize', adjustLayout);
    }
    window.addEventListener('orientationchange', () => { setTimeout(adjustLayout, 150); });

    // --- Listeners para foco en el textarea ---
    scriptInput.addEventListener('focus', () => { console.log("Textarea focused"); setTimeout(adjustLayout, 300); });
    scriptInput.addEventListener('blur', () => { console.log("Textarea blurred"); setTimeout(adjustLayout, 150); });


    // --- Funciones Auxiliares ---
    function startScroll() {
        if (teleprompterDisplay.innerHTML.trim() === '') return;
        isPlaying = true;
        playPauseBtn.textContent = 'Pause';
        playPauseBtn.classList.add('playing');
        scriptInput.disabled = true;
        teleprompterDisplay.contentEditable = 'false';
        teleprompterDisplay.style.scrollBehavior = 'auto';
        scriptInput.style.display = 'none';
        adjustLayout();

        teleprompterDisplay.scrollTop = scrollPosition;
        if (scrollInterval) clearInterval(scrollInterval);

        console.log("Starting scroll with speed:", currentSpeed); // Log al iniciar
        scrollInterval = setInterval(() => {
            // currentSpeed se lee aquí en cada ciclo
            const scrollAmount = currentSpeed * 0.5; // Ajusta este multiplicador si quieres calibrar la "sensación" de velocidad
            if (isNaN(scrollAmount) || scrollAmount <= 0) {
                 console.warn("Scroll interval stopped due to invalid scrollAmount:", scrollAmount, " (currentSpeed: ", currentSpeed, ")");
                 pauseScroll(); // Pausar si la velocidad no es válida
                 return;
            }
            teleprompterDisplay.scrollTop += scrollAmount;
            scrollPosition = teleprompterDisplay.scrollTop;
            if (teleprompterDisplay.scrollTop + teleprompterDisplay.clientHeight >= teleprompterDisplay.scrollHeight - 5) {
                console.log("Reached end of scroll.");
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
        scriptInput.style.display = 'block';
        adjustLayout();

        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
            console.log("Scroll interval cleared.");
        }
        scrollPosition = teleprompterDisplay.scrollTop;
        console.log("Paused scroll at:", scrollPosition);
    }

    function stopScroll() {
        pauseScroll();
        teleprompterDisplay.scrollTop = 0;
        scrollPosition = 0;
        console.log("Stopped scroll and reset position.");
    }

    // --- Inicialización ---
    function initializeApp() {
        try {
            // Establecer valores iniciales de los sliders y texto asociado
            currentSpeed = parseInt(speedControl.value, 10) || 5; // Asegurar valor inicial numérico
            speedControl.value = currentSpeed; // Sincronizar slider
            if (speedValueSpan) speedValueSpan.textContent = currentSpeed;

            const initialFontSize = parseInt(fontSizeControl.value, 10) || 40;
            fontSizeControl.value = initialFontSize; // Sincronizar slider
            teleprompterDisplay.style.fontSize = `${initialFontSize}px`;
            if (fontSizeValueSpan) fontSizeValueSpan.textContent = `${initialFontSize}px`;

            // Cargar texto inicial si existe
            if (scriptInput.value) {
                 teleprompterDisplay.innerHTML = scriptInput.value.replace(/\n/g, '<br>');
            }
            scriptInput.style.display = 'block';

            console.log("App initialized. Initial speed:", currentSpeed, "Initial font size:", initialFontSize + "px");

            // Ajustar layout inicial después de un breve delay
            setTimeout(adjustLayout, 150); // Un poco más de tiempo por si acaso

        } catch(error) {
            console.error("Error during app initialization:", error);
            alert("Hubo un error al iniciar la aplicación.");
        }
    }

    initializeApp(); // Llamar a la función de inicialización

}); // Fin DOMContentLoaded