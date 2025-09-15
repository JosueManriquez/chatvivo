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

let usuarios = {};

io.on("connection", (socket) => {
    console.log("Un cliente se conectó:", socket.id);

    socket.on("nuevo-usuario", (nombre) => {
        socket.data.nombre = nombre;
        usuarios[socket.id] = nombre;

        console.log(`${nombre} se ha conectado`);

        // Avisar a todos
        io.emit("mensaje-global", {
            nombre: "Servidor",
            mensaje: `${nombre} se ha unido al chat`
        });

        // Enviar lista actualizada
        io.emit("usuarios-online", Object.values(usuarios));
    });

    socket.on("mensaje-global", (data) => {
        console.log(`${data.nombre}: ${data.mensaje}`);
        io.emit("mensaje-global", data);
    });

    socket.on("disconnect", () => {
        if (socket.data.nombre) {
            console.log(`${socket.data.nombre} se ha desconectado`);

            delete usuarios[socket.id]; // quitarlo de la lista

            io.emit("mensaje-global", {
                nombre: "Servidor",
                mensaje: `${socket.data.nombre} ha salido del chat`
            });

            // Actualizar lista
            io.emit("usuarios-online", Object.values(usuarios));
        }
    });
});

server.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
