import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import roomRoutes from './rooms.js' // 改成 export default function

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
})

// 全域儲存
const globalRooms = new Map()
const globalClients = new Map()
app.use(cors())
app.use(express.json())

// 提供 REST API 查詢/刪除房間
app.use('/rooms', (req, res) => {
  roomRoutes(req, res, io)
})

// WebSocket 初始化
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // 建立房間
  socket.on('create-room', ({ roomId, roomName, hostId, maxMembers }) => {
    if (globalRooms.has(roomId)) {
      socket.emit('room-error', { error: '房間已存在', roomId })
      return
    }

    const room = {
      id: roomId,
      name: roomName,
      hostId: hostId || socket.id,
      createdAt: Date.now(),
      members: [socket.id],
      maxMembers: maxMembers || 10
    }

    globalRooms.set(roomId, room)
    socket.join(roomId)
    globalClients.set(socket.id, roomId)
    console.log(`Room created: ${roomId} by ${socket.id}`)

    socket.emit('room-created', { roomId, room })
  })

  // 加入房間
  socket.on('join-room', (roomId) => {
    const room = globalRooms.get(roomId)
    if (!room) return socket.emit('room-error', { error: '房間不存在', roomId })

    if (room.members.length >= room.maxMembers) {
      return socket.emit('room-error', { error: '房間已滿', roomId })
    }

    if (room.members.includes(socket.id)) {
      return socket.emit('room-error', { error: '您已在房間中', roomId })
    }

    room.members.push(socket.id)
    globalClients.set(socket.id, roomId)
    socket.join(roomId)
    socket.to(roomId).emit('user-joined', { userId: socket.id, timestamp: Date.now() })
    socket.emit('room-joined', { roomId, room })
  })

  // 離開房間
  socket.on('leave-room', () => {
    const roomId = globalClients.get(socket.id)
    if (!roomId) return
    const room = globalRooms.get(roomId)
    if (!room) return

    room.members = room.members.filter(id => id !== socket.id)
    if (room.members.length === 0) {
      globalRooms.delete(roomId)
    } else if (room.hostId === socket.id) {
      room.hostId = room.members[0]
    }

    socket.leave(roomId)
    globalClients.delete(socket.id)
    socket.to(roomId).emit('user-left', { userId: socket.id, timestamp: Date.now() })
  })

  // 播放同步事件
  socket.on('play-state', (data) => {
    const roomId = globalClients.get(socket.id)
    if (roomId) socket.to(roomId).emit('play-state-update', { ...data, userId: socket.id })
  })
  socket.on('pause-state', (data) => {
    const roomId = globalClients.get(socket.id)
    if (roomId) socket.to(roomId).emit('pause-state-update', { ...data, userId: socket.id })
  })
  socket.on('seek-time', (data) => {
    const roomId = globalClients.get(socket.id)
    if (roomId) socket.to(roomId).emit('seek-time-update', { ...data, userId: socket.id })
  })

  socket.on('disconnect', () => {
    const roomId = globalClients.get(socket.id)
    if (roomId) {
      const room = globalRooms.get(roomId)
      if (room) {
        room.members = room.members.filter(id => id !== socket.id)
        if (room.members.length === 0) {
          globalRooms.delete(roomId)
        } else if (room.hostId === socket.id) {
          room.hostId = room.members[0]
        }
        socket.to(roomId).emit('user-left', { userId: socket.id, timestamp: Date.now() })
      }
      globalClients.delete(socket.id)
    }
    console.log('Client disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
