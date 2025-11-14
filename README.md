# LOOTBOX 🎮

A personalized game review platform inspired by Letterboxd, built with React and Node.js. Browse, explore, and favorite video games with a beautiful, modern interface featuring a prominent red color scheme.

## ✨ Features

- 🔐 User authentication (Login/Register)
- 🎮 Game browsing with infinite scroll
- 🔍 Real-time game search
- 📱 Responsive design
- ❤️ Favorites system
- 🎨 Letterboxd-inspired UI with red theme
- 🔒 Protected routes
- 🛡️ Secure API key handling (server-side only)
- 📊 Detailed game information
- 🎯 Smart image fallbacks

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for detailed installation instructions.

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd LOOTBOX-main
```

2. **Setup server**
```bash
cd server
npm install
cp ENV_TEMPLATE.txt .env
# Edit .env with your database credentials and API keys
```

3. **Setup database**
```bash
mysql -u root -p lootbox_db < database/schema.sql
```

4. **Setup client**
```bash
cd ../client
npm install
```

5. **Start the application**
```bash
# Terminal 1 - Server
cd server
npm start

# Terminal 2 - Client
cd client
npm run dev
```

6. **Access the app**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🛠️ Tech Stack

### Frontend
- **React** 19 - UI library
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling
- **DOMPurify** - XSS protection
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### API
- **RAWG API** - Game data source

## 📁 Project Structure

```
LOOTBOX-main/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components (ProtectedRoute)
│   │   ├── data/
│   │   │   └── components/ # Page components (Auth, Games, GameDetail, GameCard)
│   │   └── App.jsx         # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── database/          # Database schema
│   ├── server.js          # Express server
│   └── package.json
└── SETUP.md               # Detailed setup guide
```

## 🔐 Security Features

- ✅ API keys stored server-side only
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Protected routes
- ✅ XSS protection with DOMPurify
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ Environment variables for secrets

## 🎨 UI Design

The UI is inspired by Letterboxd with:
- Dark theme (#14181C)
- Prominent red accent color (#E50000)
- Card-based layout
- Smooth transitions
- Responsive grid system
- Custom scrollbar styling

## 📝 Environment Variables

### Server (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lootbox_db
JWT_SECRET=your_jwt_secret
PORT=3001
RAWG_API_KEY=your_rawg_api_key
```

### Client
- `VITE_API_BASE_URL` - Backend API URL (defaults to http://localhost:3001)

## 🐛 Troubleshooting

See [SETUP.md](./SETUP.md) for troubleshooting guide.

## 📄 License

MIT

## 🙏 Acknowledgments

- [RAWG API](https://rawg.io/apidocs) for game data
- [Letterboxd](https://letterboxd.com) for design inspiration
