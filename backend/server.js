const express = require("express");
const WebSocket = require("ws");
const noble = require("@abandonware/noble");

const DEVICE_NAME = "Bangle.js 0f66";
const app = express();
const wss = new WebSocket.Server({ noServer: true });

let wsClients = [];

// Inicia o servidor WebSocket
wss.on("connection", (ws) => {
  wsClients.push(ws);
  console.log("Cliente WebSocket conectado.");

  ws.on("close", () => {
    wsClients = wsClients.filter((client) => client !== ws);
    console.log("Cliente WebSocket desconectado.");
  });
});

app.server = app.listen(3001, () => {
  console.log("Servidor backend rodando na porta 3001");
});

// Inicia o Bluetooth
noble.on("stateChange", (state) => {
  if (state === "poweredOn") {
    console.log("Bluetooth ligado. Procurando dispositivos...");
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on("discover", (peripheral) => {
  const name = peripheral.advertisement.localName;
  if (name && name.includes(DEVICE_NAME)) {
    console.log(`Dispositivo encontrado: ${name}, tentando conectar...`);

    noble.stopScanning();

    peripheral.connect((error) => {
      if (error) {
        console.error("Erro ao conectar:", error);
        return;
      }

      console.log("Conectado ao Bangle.js 2!");

      peripheral.discoverServices([], (err, services) => {
        if (err) {
          console.error("Erro ao descobrir serviços:", err);
          return;
        }

        services.forEach((service) => {
          service.discoverCharacteristics([], (err, characteristics) => {
            if (err) {
              console.error("Erro ao descobrir características:", err);
              return;
            }

            characteristics.forEach((char) => {
              if (char.properties.includes("notify")) {
                console.log("Recebendo dados...");
                char.on("data", (data) => {
                  console.log(data.toString());

                  // Envia os dados para todos os clientes WebSocket
                  wsClients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                      client.send(data.toString());
                    }
                  });
                });
                char.subscribe();
              }
            });
          });
        });
      });
    });
  }
});

// Permite o servidor Express lidar com as requisições WebSocket
app.server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});
