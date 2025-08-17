# Netflix Sync Server

A backend server that enables multiple users to watch Netflix content synchronously. Uses WebSocket technology to achieve real-time playback state synchronization.

## Features

- Room System: Create and manage viewing rooms
- Real-time Sync: Support for play, pause, and progress synchronization
- Multi-user Interaction: Support for multiple users watching simultaneously
- REST API: Provides room query and management functionality

## Tech Stack

- Node.js
- Express.js
- Socket.IO
- CORS

## Installation

```bash
yarn install
```

## Running the Server

```bash
yarn start
```

The server will start on port 3000 (or the port specified in the PORT environment variable)

## API Endpoints

### REST API

- `GET /rooms` - Get list of all rooms
- `DELETE /rooms` - Delete a specific room

### WebSocket Events

#### Client Events (Emit)
- `create-room` - Create a new room
- `join-room` - Join an existing room
- `leave-room` - Leave current room
- `play-state` - Update play state
- `pause-state` - Update pause state
- `seek-time` - Adjust playback time

#### Server Events (Listen)
- `room-created` - Room created successfully
- `room-joined` - Successfully joined room
- `room-error` - Room operation error
- `user-joined` - New user joined
- `user-left` - User left
- `play-state-update` - Play state update
- `pause-state-update` - Pause state update
- `seek-time-update` - Playback time update

## License

MIT License
