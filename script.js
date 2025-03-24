document.addEventListener("DOMContentLoaded", function () {
    const startButton = document.getElementById("startButton");
    const pauseButton = document.getElementById("pauseButton");
    const resetButton = document.getElementById("resetButton");
    const daySelect = document.getElementById("daySelect");
    const horariosList = document.getElementById("horarios");
    const countdown = document.getElementById("countdown");

    // Criando os controles de velocidade dinamicamente
    const speedControls = document.createElement('div');
    // speedControls.className = 'speed-controls';
    // speedControls.innerHTML = `
    //     <p>Velocidade de Teste:</p>
    //     <button class="speed-btn active" data-speed="1">1x</button>
    //     <button class="speed-btn" data-speed="10">10x</button>
    //     <button class="speed-btn" data-speed="60">60x</button>
    //     <button class="speed-btn" data-speed="600">600x</button>
    // `;
    // countdown.parentNode.insertBefore(speedControls, countdown.nextSibling);

    let timer;
    let horarios = [];
    let contadorAtivo = false;
    let tempoInicial;
    let tempoDecorridoSalvo = localStorage.getItem("tempoDecorrido") || 0;
    let speedMultiplier = 1; // Multiplicador de velocidade padrão (1x)

    const audioAlert = new Audio('/alarme.mp3');
    const audioEnd = new Audio('/alarmeSchool.mp3');
    const audioInicio = new Audio('/alarmeSchool.mp3');

    let alerta15MinDisparado = false;
    let alerta5MinDisparado = false;

    function gerarHorarios(dia) {
        horarios = [];
        let duracao = dia === "first" ? 5.5 : 5;

        let inicioFicticio = new Date();
        inicioFicticio.setHours(13, 30, 0, 0);

        // Gerar horários a cada 30 minutos
        const numeroIntervalos = Math.floor(duracao * 2); // 5.5h = 11 intervalos de 30 min
        for (let i = 0; i <= numeroIntervalos; i++) {
            let hora = new Date(inicioFicticio.getTime());
            hora.setMinutes(hora.getMinutes() + (i * 30));
            horarios.push(formatarHorario(hora));
        }

        // Adicionar marcos de 15 e 5 minutos antes do final
        const tempoFinal = duracao * 60 * 60 * 1000;
        const ultimoHorario = new Date(inicioFicticio.getTime() + tempoFinal);
        horarios.push(formatarHorario(new Date(ultimoHorario.getTime() - 15 * 60 * 1000)));
        horarios.push(formatarHorario(new Date(ultimoHorario.getTime() - 5 * 60 * 1000)));

        // Ordenar horários numericamente
        horarios.sort((a, b) => {
            const [ah, am] = a.split(':').map(Number);
            const [bh, bm] = b.split(':').map(Number);
            return (ah * 60 + am) - (bh * 60 + bm);
        });

        // Exibir horários na interface
        horariosList.innerHTML = "";
        horarios.forEach(horario => {
            const horarioId = horario.replace(":", "-");
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="checkbox-wrapper">
                    <input type="checkbox" class="check" id="check-${horarioId}">
                    <label class="horario" for="check-${horarioId}">
                        <svg width="45" height="45" viewBox="0 0 95 95">
                            <rect x="30" y="20" width="50" height="50" stroke="black" fill="none"></rect>
                            <g transform="translate(0,-952.36222)">
                                <path class="path1" d="m 56,963 c -102,122 6,9 7,9 17,-5 -66,69 -38,52 122,-77 -7,14 18,4 29,-11 45,-43 23,-4" stroke="black" stroke-width="3" fill="none"></path>
                            </g>
                        </svg>
                        <span>${horario}</span>
                    </label>
                </div>
            `;
            horariosList.appendChild(li);
        });
    }

    function formatarHorario(data) {
        return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
    }

    function iniciarContador() {
        if (contadorAtivo) {
            clearInterval(timer);
            contadorAtivo = false;
            startButton.textContent = "Iniciar Contador";
            return;
        }

        contadorAtivo = true;
        startButton.textContent = "Parar Contador";

        // Resetar e tocar áudio de início
        audioInicio.currentTime = 0;
        audioInicio.play();

        tempoInicial = new Date() - tempoDecorridoSalvo;

        gerarHorarios(daySelect.value);

        // Resetar alertas
        alerta15MinDisparado = false;
        alerta5MinDisparado = false;

        timer = setInterval(updateTimer, 1000 / speedMultiplier);
    }

    function updateTimer() {
        const agora = new Date();
        // Tempo decorrido real (considerando velocidade)
        let tempoDecorrido = (agora - tempoInicial) * speedMultiplier;
        
        // Salvar progresso
        localStorage.setItem("tempoDecorrido", tempoDecorrido);
    
        // Calcular tempo restante
        const tempoTotal = (daySelect.value === "first" ? 5.5 : 5) * 60 * 60 * 1000;
        const tempoRestante = Math.max(0, tempoTotal - tempoDecorrido);
    
        // Marcar horários concluídos - CORREÇÃO AQUI
        horarios.forEach((horario, index) => {
            const horarioId = horario.replace(":", "-");
            // Calcula o tempo simulado baseado no horário real, não no índice
            const partes = horario.split(':');
            const horas = parseInt(partes[0]);
            const minutos = parseInt(partes[1]);
            
            // Horário de início fictício (13:30)
            const inicioFicticio = new Date();
            inicioFicticio.setHours(13, 30, 0, 0);
            
            // Calcula a diferença em milissegundos para cada horário
            const horarioAlvo = new Date(inicioFicticio);
            horarioAlvo.setHours(horas, minutos, 0, 0);
            
            const tempoSimulado = horarioAlvo - inicioFicticio;
            
            if (tempoDecorrido >= tempoSimulado) {
                document.querySelector(`#check-${horarioId}`).checked = true;
            }
        });
    
        const horasRestantes = Math.floor(tempoRestante / (1000 * 60 * 60));
        const minutosRestantes = Math.floor((tempoRestante % (1000 * 60 * 60)) / (1000 * 60));
        const segundosRestantes = Math.floor((tempoRestante % (1000 * 60)) / 1000);
    
        countdown.textContent = `${String(horasRestantes).padStart(2, '0')}:${String(minutosRestantes).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`;
    
        // Disparar alertas - CORREÇÃO AQUI
        const ultimos15Minutos = 15 * 60 * 1000;
        const ultimos5Minutos = 5 * 60 * 1000;
        
        if (tempoRestante <= ultimos15Minutos && tempoRestante > ultimos5Minutos && !alerta15MinDisparado) {
            audioAlert.currentTime = 0;
            audioAlert.play();
            alerta15MinDisparado = true;
            console.log("Alerta de 15 minutos disparado");
        }
    
        if (tempoRestante <= ultimos5Minutos && tempoRestante > 0 && !alerta5MinDisparado) {
            audioAlert.currentTime = 0;
            audioAlert.play();
            alerta5MinDisparado = true;
            console.log("Alerta de 5 minutos disparado");
        }
    
        // Finalizar quando o tempo acabar
        if (tempoRestante <= 0) {
            clearInterval(timer);
            audioEnd.currentTime = 0;
            audioEnd.play();
            countdown.textContent = "Fim da Prova!";
            contadorAtivo = false;
            startButton.textContent = "Iniciar Contador";
        }
    }

    function pausarContador() {
        if (contadorAtivo) {
            clearInterval(timer);
            contadorAtivo = false;
            startButton.textContent = "Retomar Contador";
        }
    }

    function resetarContador() {
        clearInterval(timer);
        contadorAtivo = false;
        tempoDecorridoSalvo = 0;
        localStorage.setItem("tempoDecorrido", tempoDecorridoSalvo);
        startButton.textContent = "Iniciar Contador";
        countdown.textContent = "00:00:00";
        alerta15MinDisparado = false;
        alerta5MinDisparado = false;
        gerarHorarios(daySelect.value);
    }

    // Função para alterar a velocidade
    function setSpeed(multiplier) {
        speedMultiplier = multiplier;
        
        // Atualiza a classe ativa dos botões
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.speed) === multiplier);
        });
        
        // Se o contador estiver ativo, reinicia com a nova velocidade
        if (contadorAtivo) {
            const wasPaused = startButton.textContent === 'Retomar Contador';
            clearInterval(timer);
            if (!wasPaused) {
                timer = setInterval(updateTimer, 1000 / speedMultiplier);
            }
        }
    }

    // Event Listeners
    startButton.addEventListener("click", iniciarContador);
    pauseButton.addEventListener("click", pausarContador);
    resetButton.addEventListener("click", resetarContador);
    daySelect.addEventListener("change", function () {
        if (contadorAtivo) {
            clearInterval(timer);
            contadorAtivo = false;
            startButton.textContent = "Iniciar Contador";
        }
        gerarHorarios(daySelect.value);
    });

    // Event listeners para os botões de velocidade
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('speed-btn')) {
            setSpeed(parseInt(e.target.dataset.speed));
        }
    });

    // Inicializar
    gerarHorarios(daySelect.value);

    // Continuar de onde parou
    if (tempoDecorridoSalvo > 0) {
        iniciarContador();
    }
});