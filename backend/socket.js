const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { query } = require('./pg_db');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

let io;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            credentials: true
        }
    });

    // Authentication Middleware for Socket.io
    io.use((socket, next) => {
        try {
            // Attempt to get token from handshake auth or cookies
            const token = socket.handshake.auth.token || getCookie(socket.handshake.headers.cookie, 'access_token');
            if (!token) return next(new Error('Authentication error'));
            
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.user = decoded; // Attach user to socket
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.id}`);

        // Join an application-specific chat room
        socket.on('join_application_room', async (applicationId) => {
            // Basic check could be added here to ensure the user is part of this application
            socket.join(`app_${applicationId}`);
            console.log(`User ${socket.user.id} joined room app_${applicationId}`);
        });

        // Handle sending messages
        socket.on('send_message', async (data) => {
            const { applicationId, content } = data;
            
            try {
                // Persist message
                const result = await query(
                    'INSERT INTO messages (application_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
                    [applicationId, socket.user.id, content]
                );

                // Broadcast to everyone in the room (including sender to confirm)
                io.to(`app_${applicationId}`).emit('receive_message', result.rows[0]);
            } catch (err) {
                console.error('Socket message error:', err);
            }
        });

        socket.on('typing', (applicationId) => {
            socket.to(`app_${applicationId}`).emit('user_typing', { userId: socket.user.id });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.id}`);
        });
    });
}

function getCookie(cookieString, name) {
    if (!cookieString) return null;
    const match = cookieString.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
}

// Helper to push notifications from Express routes
function sendNotification(userId, message) {
    if (io) {
        // Find if user is connected (would require mapping userIds to socketIds, simplified here)
        // Usually you'd store active users in a Map
        io.emit(`notification_${userId}`, { message });
    }
}

module.exports = {
    initSocket,
    sendNotification
};
