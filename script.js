document.addEventListener("DOMContentLoaded", function () {
    const startButton = document.getElementById("startButton");
    const pauseButton = document.getElementById("pauseButton");
    const resetButton = document.getElementById("resetButton");
    const daySelect = document.getElementById("daySelect");
    const horariosList = document.getElementById("horarios");
    const countdown = document.getElementById("countdown");
    let timer;
    let horarios = [];
    let contadorAtivo = false;
    let tempoInicial;
    let tempoDecorridoSalvo = localStorage.getItem("tempoDecorrido") || 0; // Recupera o tempo decorrido do localStorage

    const audioAlert = new Audio('alarme.mp3'); // Áudio para o alerta de 15min
    const audioEnd = new Audio('alarmeSchool.mp3'); // Áudio para o fim da prova
    const audioInicio = new Audio('alarmeSchool.mp3'); // Áudio para o início do contador

    function gerarHorarios(dia) {
        horarios = [];
        let duracao = dia === "first" ? 5.5 : 5; // 5h30min ou 5h

        // Define o horário fictício de início como 13:30
        let inicioFicticio = new Date();
        inicioFicticio.setHours(13, 30, 0, 0);

        // Gera os horários a partir do horário fictício
        for (let i = 0; i <= duracao * 2; i++) { // Intervalos de 30 minutos
            let hora = new Date(inicioFicticio.getTime());
            hora.setMinutes(hora.getMinutes() + (i * 30));

            let horarioFormatado = `${String(hora.getHours()).padStart(2, '0')}:${String(hora.getMinutes()).padStart(2, '0')}`;
            horarios.push(horarioFormatado);
        }

        // Adicionando os horários de alerta (15min e 5min antes do final da prova)
        const tempoFinal = (dia === "first" ? 5.5 : 5) * 60 * 60 * 1000; // Duração total da prova em ms
        const ultimoHorario = new Date(inicioFicticio.getTime() + tempoFinal);

        // Hora de 15 minutos antes do final da prova
        horarios.push(formatarHorario(new Date(ultimoHorario.getTime() - 15 * 60 * 1000))); // 15 minutos antes
        // Hora de 5 minutos antes do final da prova
        horarios.push(formatarHorario(new Date(ultimoHorario.getTime() - 5 * 60 * 1000)));  // 5 minutos antes

        // Ordenando os horários em ordem crescente
        horarios.sort((a, b) => {
            const [ah, am] = a.split(':').map(Number);
            const [bh, bm] = b.split(':').map(Number);
            return ah !== bh ? ah - bh : am - bm;
        });

        horariosList.innerHTML = ""; // Limpa a lista antes de adicionar os horários

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

        // Toca o áudio quando o contador inicia
        audioInicio.play();

        // Define o momento real do início do contador
        tempoInicial = new Date() - tempoDecorridoSalvo; // Continuar de onde parou

        // Atualiza os horários de acordo com o dia selecionado
        gerarHorarios(daySelect.value);

        timer = setInterval(function () {
            const agora = new Date();
            let tempoDecorrido = agora - tempoInicial; // Tempo decorrido desde que iniciou o contador

            // Salva o tempo decorrido no localStorage
            localStorage.setItem("tempoDecorrido", tempoDecorrido);

            horarios.forEach((horario, index) => {
                const horarioId = horario.replace(":", "-");
                
                // O tempo fictício começa "imaginariamente" às 13:30 e avança de meia em meia hora
                let tempoSimulado = index * 30 * 60 * 1000; // Cada horário está a 30min do anterior

                // Se o tempo decorrido for maior ou igual ao tempo simulado, marcar o checkbox
                if (tempoDecorrido >= tempoSimulado) {
                    document.querySelector(`#check-${horarioId}`).checked = true;
                }
            });

            // Calcula o tempo restante com base na duração da prova
            const tempoTotal = (daySelect.value === "first" ? 5.5 : 5) * 60 * 60 * 1000;
            const tempoRestante = Math.max(0, tempoTotal - tempoDecorrido);

            const horasRestantes = Math.floor(tempoRestante / (1000 * 60 * 60));
            const minutosRestantes = Math.floor((tempoRestante % (1000 * 60 * 1000)) / (1000 * 60));
            const segundosRestantes = Math.floor((tempoRestante % (1000 * 60)) / 1000);

            countdown.textContent = `${String(horasRestantes).padStart(2, '0')}:${String(minutosRestantes).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`;

            // Alerta de 15 minutos antes do final
            if (tempoRestante <= 15 * 60 * 1000 && tempoRestante > 14 * 60 * 1000) {
                audioAlert.play();
            }

            // Alerta de 5 minutos antes do final
            if (tempoRestante <= 5 * 60 * 1000 && tempoRestante > 4 * 60 * 1000) {
                audioAlert.play();
            }

            // Alerta no fim da prova
            if (tempoRestante <= 0) {
                clearInterval(timer);
                audioEnd.play();
                countdown.textContent = "Fim da Prova!";
            }
        }, 1000);
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
        gerarHorarios(daySelect.value);
    }

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

    // Inicializa com os horários do primeiro dia
    gerarHorarios(daySelect.value);

    // Iniciar o contador com o tempo salvo, caso já tenha sido iniciado antes
    if (tempoDecorridoSalvo > 0) {
        iniciarContador();
    }
});
