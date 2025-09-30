// Simple WebSocket server for Next.js
const { Server } = require('socket.io');

let io = null;

function initializeWebSocket(server) {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_APP_URL 
          : 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
  
  return io;
}

function getWebSocketServer() {
  return io;
}

function broadcastLearningUpdate(data) {
  if (io) {
    io.emit('learning-update', data);
  }
}

module.exports = {
  initializeWebSocket,
  getWebSocketServer,
  broadcastLearningUpdate,
};
