document.addEventListener("DOMContentLoaded", function () {
    const startButton = document.getElementById("startButton");
    const daySelect = document.getElementById("daySelect");
    const horariosList = document.getElementById("horarios");
    const countdown = document.getElementById("countdown");
    let timer;
    let horarios = [];
    let contadorAtivo = false;

    function gerarHorarios(dia, inicio) {
        horarios = [];
        let duracao = dia === "first" ? 5.5 : 5; // 5h30min ou 5h

        // Calcula os horários a partir do momento de início
        for (let i = 0; i <= duracao * 2; i++) {  // multiplicado por 2 porque temos intervalos de 30 minutos
            let hora = new Date(inicio.getTime());
            hora.setMinutes(hora.getMinutes() + (i * 30));

            let horarioFormatado = `${String(hora.getHours()).padStart(2, '0')}:${String(hora.getMinutes()).padStart(2, '0')}`;
            horarios.push(horarioFormatado);
        }

        horariosList.innerHTML = ""; // Limpar a lista antes de adicionar os horários

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

        // Pega o horário atual do sistema
        const horaAtual = new Date();

        // Gerar os horários a partir do horário atual
        gerarHorarios(daySelect.value, horaAtual);

        // Inicia o cronômetro
        timer = setInterval(function () {
            const horaAtual = new Date();
            const horaAtualFormatada = `${String(horaAtual.getHours()).padStart(2, '0')}:${String(horaAtual.getMinutes()).padStart(2, '0')}`;

            // Verifica se algum horário já passou e risca o quadrado correspondente
            horarios.forEach(horario => {
                const horarioId = horario.replace(":", "-");
                if (horario === horaAtualFormatada) {
                    document.querySelector(`#check-${horarioId}`).checked = true;
                }
            });

            // Calcula o tempo restante
            const tempoRestante = Math.max(0, (daySelect.value === "first" ? 5.5 : 5) * 60 * 60 * 1000 - (horaAtual - new Date(horaAtual.getFullYear(), horaAtual.getMonth(), horaAtual.getDate(), horaAtual.getHours(), horaAtual.getMinutes()))); // tempo restante da prova em milissegundos
            const horasRestantes = Math.floor(tempoRestante / (1000 * 60 * 60)); // Converte de milissegundos para horas
            const minutosRestantes = Math.floor((tempoRestante % (1000 * 60 * 60)) / (1000 * 60)); // Converte para minutos
            const segundosRestantes = Math.floor((tempoRestante % (1000 * 60)) / 1000); // Converte para segundos

            countdown.textContent = `${String(horasRestantes).padStart(2, '0')}:${String(minutosRestantes).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`;

        }, 1000); // Atualiza a cada 1 segundo
    }

    startButton.addEventListener("click", iniciarContador);
    daySelect.addEventListener("change", function () {
        if (contadorAtivo) {
            clearInterval(timer);
            contadorAtivo = false;
            startButton.textContent = "Iniciar Contador";
        }

        gerarHorarios(daySelect.value, new Date());
    });
});