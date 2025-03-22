// Ativar sensores de HRM
Bangle.setHRMPower(1); // Liga o sensor de batimentos cardíacos

// Carrega os widgets ao iniciar
Bangle.loadWidgets();

// Função para enviar os dados como JSON
function sendData() {
  let health = Bangle.getHealthStatus("day");
  let accel = Bangle.getAccel();
  let temperature = E.getTemperature();

  // Criando um objeto JSON com os dados
  let data = {
    time: new Date().toISOString(),
    hrm: {
      bpm: health.bpm,                // Batimentos cardíacos
      confidence: health.bpmConfidence // Confiança da leitura
    },
    steps: health.steps,              // Passos
    distance: health.distance,        // Distância percorrida
    calories: health.calories,        // Calorias queimadas
    accel: {                          // Dados do acelerômetro
      x: accel.x.toFixed(3),
      y: accel.y.toFixed(3),
      z: accel.z.toFixed(3)
    },
    temperature: temperature          // Temperatura
  };

  Bluetooth.println(JSON.stringify(data)); // Envia os dados como JSON
}

// Atualiza o HRM a cada 1 segundo (mas sem usar setPollInterval)
setInterval(function() {
  // Reativa o sensor de HRM, caso necessário
  Bangle.setHRMPower(1); // Mantém o sensor de HRM ligado
}, 1000);

// Função para controlar o envio dos dados com espaçamento de 2 segundos
let interval = 0;
function sendDataSequentially() {
  if (interval === 0) {
    let data = {
      time: new Date().toISOString(),
    };
    Bluetooth.println(JSON.stringify(data));
  } else if (interval === 1) {
    let health = Bangle.getHealthStatus("day");
    let hrmData = {
      hrm: {
        bpm: health.bpm,
        confidence: health.bpmConfidence
      }
    };
    Bluetooth.println(JSON.stringify(hrmData));
  } else if (interval === 2) {
    let health = Bangle.getHealthStatus("day");
    let stepsData = {
      steps: health.steps
    };
    Bluetooth.println(JSON.stringify(stepsData));
  } else if (interval === 3) {
    let accel = Bangle.getAccel();
    let accelData = {
      accel: {
        x: accel.x.toFixed(3),
        y: accel.y.toFixed(3),
        z: accel.z.toFixed(3)
      }
    };
    Bluetooth.println(JSON.stringify(accelData));
  } else if (interval === 4) {
    let temperature = E.getTemperature();
    let temperatureData = {
      temperature: temperature
    };
    Bluetooth.println(JSON.stringify(temperatureData));
  }

  // Atualiza o contador para o próximo dado
  interval = (interval + 1) % 5; // Reinicia após o envio de todos os dados
}

// Enviar os dados a cada 2 segundos
setInterval(sendDataSequentially, 1000);  // Envia os dados sequencialmente a cada 2 segundos

// Garantir que o código rode após reiniciar
E.on('init', function() {
  sendDataSequentially();  // Envia os dados imediatamente após reiniciar
});
