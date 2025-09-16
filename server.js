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

// Contador global de likes
let likes = 0;

io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado:", socket.id);

    // Enviar contador actual al usuario que entra
    socket.emit("contador-actual", likes);

    // Cuando alguien da like
    socket.on("nuevo-like", () => {
        likes++;
        console.log("Likes totales:", likes);
        io.emit("contador-actual", likes); // actualizar a todos
    });
});

server.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
