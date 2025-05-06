import { logger } from './logger.service.js'
import { Server } from 'socket.io'

let gIo = null

export function setupSocketAPI(http) {
    gIo = new Server(http, {
        cors: {
            origin: '*',
        }
    })

    gIo.on('connection', socket => {
        logger.info(`Socket connected [id: ${socket.id}]`)

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected [id: ${socket.id}]`)
        })

        socket.on('set-user-socket', userId => {
            logger.info(`Socket set-user-socket: ${userId}`)
            socket.userId = userId
        })

        socket.on('unset-user-socket', () => {
            logger.info(`Socket unset-user-socket`)
            delete socket.userId
        })

        socket.on('admin-select-song', (song) => {
            logger.info(`Admin selected song: ${song.name}, broadcasting to all users`)
            gIo.emit('start-live-session', song)
        })

        socket.on('end-live-session', () => {
            logger.info(`Live session ended by socket [id: ${socket.id}]`)
            gIo.emit('end-live-session')
        })
    })
}

// Emit to all sockets (or by label like user room)
function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label.toString()).emit(type, data)
    else gIo.emit(type, data)
}

// Emit to specific user by ID
async function emitToUser({ type, data, userId }) {
    const socket = await _getUserSocket(userId)
    if (socket) {
        logger.info(`Emit event ${type} to user ${userId}`)
        socket.emit(type, data)
    } else {
        logger.info(`No active socket for user: ${userId}`)
    }
}

// Broadcast to everyone except the user
async function broadcast({ type, data, room = null, userId }) {
    const excludedSocket = await _getUserSocket(userId)
    if (room && excludedSocket) {
        excludedSocket.broadcast.to(room).emit(type, data)
    } else if (excludedSocket) {
        excludedSocket.broadcast.emit(type, data)
    } else if (room) {
        gIo.to(room).emit(type, data)
    } else {
        gIo.emit(type, data)
    }
}

// Helper: find socket by user ID
async function _getUserSocket(userId) {
    const sockets = await gIo.fetchSockets()
    return sockets.find(s => s.userId === userId)
}

// Optional for debugging
async function _printSockets() {
    const sockets = await gIo.fetchSockets()
    console.log(`Sockets (${sockets.length} total):`)
    sockets.forEach(socket => {
        console.log(`- ID: ${socket.id} | userId: ${socket.userId}`)
    })
}

export const socketService = {
    setupSocketAPI,
    emitTo,
    emitToUser,
    broadcast
}
