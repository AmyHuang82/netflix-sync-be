export default function handler(req, res, io) {
  if (req.method === 'GET') {
    const globalRooms = io ? io.sockets.adapter.rooms : new Map()
    const roomList = []
    io?.sockets.sockets?.forEach((_, socketId) => {
      const roomId = io.rooms?.get(socketId)
      if (roomId) {
        const room = globalRooms.get(roomId)
        if (room) {
          roomList.push({
            id: room.id,
            name: room.name,
            memberCount: room.members.length,
            maxMembers: room.maxMembers,
            hostId: room.hostId,
            createdAt: room.createdAt
          })
        }
      }
    })
    return res.status(200).json({ rooms: roomList })
  }

  if (req.method === 'DELETE') {
    const { roomId } = req.body
    const globalRooms = io.sockets.adapter.rooms
    const room = globalRooms.get(roomId)
    if (!room) return res.status(404).json({ error: 'Room not found' })

    io.to(roomId).emit('room-deleted', { roomId })
    room.members?.forEach(socketId => {
      const socket = io.sockets.sockets.get(socketId)
      socket?.leave(roomId)
      socket?.emit('room-deleted', { roomId })
    })

    globalRooms.delete(roomId)
    return res.status(200).json({ message: 'Room deleted successfully' })
  }

  res.setHeader('Allow', ['GET', 'DELETE'])
  res.status(405).json({ error: 'Method not allowed' })
}
