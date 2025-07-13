# How to Run the Socket.io Chat Application

## 🚀 Quick Start

### Option 1: Use the Batch Script (Recommended)
Simply double-click or run:
```
start.bat
```
This will automatically start both the server and client in separate command windows.

### Option 2: Manual Start

**Terminal 1 - Start Server:**
```bash
cd server
pnpm run dev
```

**Terminal 2 - Start Client:**
```bash
cd client
pnpm start
```

## 📱 Access the Application

- **Client**: http://localhost:3000
- **Server API**: http://localhost:5000

## 🎯 How to Use

1. **Login**: Enter a username when prompted
2. **Join Rooms**: You'll automatically join the "General" room
3. **Chat**: Start typing and send messages in real-time
4. **Create Rooms**: Click the "+" button to create new rooms
5. **Private Messages**: Click on online users to start private conversations
6. **Reactions**: Hover over messages and click the emoji button to add reactions
7. **Search**: Use the search box to find messages
8. **Status**: Your online status is automatically updated

## ✨ Features Available

- ✅ Real-time messaging
- ✅ Multiple chat rooms
- ✅ Private messaging
- ✅ Typing indicators
- ✅ Message reactions
- ✅ Read receipts
- ✅ Online/offline status
- ✅ Browser notifications
- ✅ Message search
- ✅ Room creation
- ✅ Auto-reconnection

## 🛠 Troubleshooting

**If localhost:3000 doesn't work:**
1. Make sure both server and client are running
2. Check that no other applications are using ports 3000 or 5000
3. Try refreshing the page
4. Check the console for any error messages

**If you get "connection refused":**
1. Restart the server: `cd server && pnpm run dev`
2. Wait for the server to fully start before accessing the client
3. Make sure port 5000 is not blocked by firewall

## 🔧 Development

**Server** (Port 5000):
- Built with Node.js, Express, and Socket.io
- In-memory data storage
- Real-time event handling

**Client** (Port 3000):
- Built with React and Socket.io-client
- Styled-components for UI
- Context API for state management

Enjoy your real-time chat application! 🎉
