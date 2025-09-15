const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const http = require('http');
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Guardar nombre de cada socket
io.on("connection", (socket) => {
    console.log("Un cliente se conectó:", socket.id);

    // Cuando el cliente envíe su nombre
    socket.on("nuevo-usuario", (nombre) => {
        socket.data.nombre = nombre;
        console.log(`${nombre} se ha conectado`);
        io.emit("mensaje-global", {
            nombre: "Servidor",
            mensaje: `${nombre} se ha unido al chat`
        });
    });

    // Cuando envíe un mensaje
    socket.on("mensaje-global", (data) => {
        console.log(`${data.nombre}: ${data.mensaje}`);
        io.emit("mensaje-global", data);
    });

    // Cuando se desconecte
    socket.on("disconnect", () => {
        if (socket.data.nombre) {
            console.log(`${socket.data.nombre} se ha desconectado`);
            io.emit("mensaje-global", {
                nombre: "Servidor",
                mensaje: `${socket.data.nombre} ha salido del chat`
            });
        }
    });
});

server.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
