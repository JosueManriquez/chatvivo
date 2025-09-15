const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const http = require('http');
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static("public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Guardar usuarios conectados
let usuarios = {};

io.on("connection", (socket) => {
    console.log("Un cliente se conectó:", socket.id);

    // Nuevo usuario
    socket.on("nuevo-usuario", (nombre) => {
        socket.data.nombre = nombre;
        usuarios[socket.id] = nombre;

        console.log(`${nombre} se ha conectado`);

        io.emit("mensaje-global", {
            nombre: "Servidor",
            mensaje: `${nombre} se ha unido al chat`
        });

        // Enviar lista de usuarios actualizada
        io.emit("usuarios-online", usuarios);
    });

    // Mensaje global
    socket.on("mensaje-global", (data) => {
        console.log(`${data.nombre}: ${data.mensaje}`);
        io.emit("mensaje-global", data);
    });

    // Mensaje privado
    socket.on("mensaje-privado", ({ destinatarioId, mensaje }) => {
        const remitente = socket.data.nombre;
        if (usuarios[destinatarioId]) {
            // Enviar solo al destinatario
            io.to(destinatarioId).emit("mensaje-privado", {
                remitente,
                mensaje
            });
            // Copia al remitente
            socket.emit("mensaje-privado", {
                remitente: `(Tú → ${usuarios[destinatarioId]})`,
                mensaje
            });
        }
    });

    // Desconexión
    socket.on("disconnect", () => {
        if (socket.data.nombre) {
            console.log(`${socket.data.nombre} se ha desconectado`);
            delete usuarios[socket.id];

            io.emit("mensaje-global", {
                nombre: "Servidor",
                mensaje: `${socket.data.nombre} ha salido del chat`
            });

            io.emit("usuarios-online", usuarios);
        }
    });
});

server.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
