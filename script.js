document.addEventListener("DOMContentLoaded", function () {
    const startButton = document.getElementById("startButton");
    const daySelect = document.getElementById("daySelect");
    const horariosList = document.getElementById("horarios");
    const countdown = document.getElementById("countdown");
    let timer;
    let horarios = [];
    let contadorAtivo = false;
    let inicioFicticio; // Variável para armazenar o horário fictício fixo

    function gerarHorarios(dia) {
        horarios = [];
        let duracao = dia === "first" ? 5.5 : 5; // 5h30min ou 5h

        // Define o horário fictício de início como 13:30
        inicioFicticio = new Date();
        inicioFicticio.setHours(13, 30, 0, 0);

        // Calcula os horários a partir do início fictício
        for (let i = 0; i <= duracao * 2; i++) { // Intervalos de 30 minutos
            let hora = new Date(inicioFicticio.getTime());
            hora.setMinutes(hora.getMinutes() + (i * 30));

            let horarioFormatado = `${String(hora.getHours()).padStart(2, '0')}:${String(hora.getMinutes()).padStart(2, '0')}`;
            horarios.push(horarioFormatado);
        }

        horariosList.innerHTML = ""; // Limpa a lista antes de adicionar os horários

        horarios.forEach(horario => {
            const horarioId = horario.replace(":", "-");
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="checkbox-wrapper">
                    <input type="checkbox" class="check" id="check-${horarioId}">
                    <label for="check-${horarioId}">
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

    function iniciarContador() {
        if (contadorAtivo) {
            clearInterval(timer);
            contadorAtivo = false;
            startButton.textContent = "Iniciar Contador";
            return;
        }

        contadorAtivo = true;
        startButton.textContent = "Parar Contador";

        gerarHorarios(daySelect.value);

        timer = setInterval(function () {
            const agora = new Date();
            
            // Cálculo do tempo decorrido desde o início fictício (13:30)
            let tempoDecorrido = agora - inicioFicticio;

            horarios.forEach(horario => {
                const horarioId = horario.replace(":", "-");

                // Converte o horário da lista para um objeto Date comparável
                let horaSimulada = new Date(inicioFicticio.getTime());
                let [h, m] = horario.split(":").map(Number);
                horaSimulada.setHours(h, m, 0, 0);

                // Marca o checkbox se o horário simulado já tiver passado
                if (horaSimulada - inicioFicticio <= tempoDecorrido) {
                    document.querySelector(`#check-${horarioId}`).checked = true;
                }
            });

            // Calcula o tempo restante baseado no tempo fictício
            const tempoTotal = (daySelect.value === "first" ? 5.5 : 5) * 60 * 60 * 1000;
            const tempoRestante = Math.max(0, tempoTotal - tempoDecorrido);

            const horasRestantes = Math.floor(tempoRestante / (1000 * 60 * 60));
            const minutosRestantes = Math.floor((tempoRestante % (1000 * 60 * 60)) / (1000 * 60));
            const segundosRestantes = Math.floor((tempoRestante % (1000 * 60)) / 1000);

            countdown.textContent = `${String(horasRestantes).padStart(2, '0')}:${String(minutosRestantes).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`;
        }, 1000);
    }

    startButton.addEventListener("click", iniciarContador);
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
});