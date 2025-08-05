export default function handler(req, res, io) {
  if (req.method === 'GET') {
    const globalRooms = io?.globalRooms || new Map();
    const roomList = Array.from(globalRooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      memberCount: room.members.length,
      maxMembers: room.maxMembers,
      hostId: room.hostId,
      createdAt: room.createdAt
    }));
    return res.status(200).json({ rooms: roomList })
  }

  if (req.method === 'DELETE') {
    const { roomId } = req.body;
    const globalRooms = io?.globalRooms;
  
    const room = globalRooms?.get(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
  
    globalRooms.delete(roomId);
    return res.status(200).json({ message: 'Room deleted successfully' });
  }

  res.setHeader('Allow', ['GET', 'DELETE'])
  res.status(405).json({ error: 'Method not allowed' })
}
