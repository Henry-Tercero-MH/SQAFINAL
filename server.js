import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { SerialPort } from 'serialport';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const port = new SerialPort({ path: 'COM3', baudRate: 9600 });

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('pinInput', (pin) => {
    port.write(pin + '\n', (err) => {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      console.log('PIN sent to Arduino');
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

port.on('data', (data) => {
  const message = data.toString().trim();
  console.log('Received from Arduino:', message);
  io.emit('rfidStatus', message);

  if (message.includes('Abriendo puerta')) {
    io.emit('doorStatus', true);
  } else if (message.includes('Cerrando puerta')) {
    io.emit('doorStatus', false);
  }
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});