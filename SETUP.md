# LOOTBOX Setup Guide

## Prerequisites

- Node.js 18+ (for built-in fetch support)
- MySQL 8.0+
- npm or yarn

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd LOOTBOX-main
```

### 2. Server Setup

```bash
cd server
npm install
```

### 3. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE lootbox_db;
```

2. Run the schema file:
```bash
mysql -u root -p lootbox_db < database/schema.sql
```

Or import it using a MySQL client like phpMyAdmin or MySQL Workbench.

### 4. Environment Configuration

1. Copy the environment template:
```bash
cp ENV_TEMPLATE.txt .env
```

2. Edit `.env` and fill in your values:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lootbox_db
JWT_SECRET=generate_a_random_string_here
PORT=3001
RAWG_API_KEY=your_rawg_api_key
```

3. Generate JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. Get RAWG API Key:
   - Visit https://rawg.io/apidocs
   - Sign up for a free account
   - Get your API key from the dashboard

### 5. Client Setup

```bash
cd ../client
npm install
```

### 6. Start the Application

#### Terminal 1 - Start Server:
```bash
cd server
npm start
```

#### Terminal 2 - Start Client:
```bash
cd client
npm run dev
```

### 7. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Project Structure

```
LOOTBOX-main/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   └── data/
│   │       └── components/ # Page components
│   └── package.json
├── server/                 # Node.js backend
│   ├── database/          # Database schema
│   ├── server.js          # Main server file
│   └── package.json
└── SETUP.md               # This file
```

## Features

- ✅ User authentication (Login/Register)
- ✅ Protected routes
- ✅ Game browsing with infinite scroll
- ✅ Game search
- ✅ Game details view
- ✅ Favorites system (localStorage)
- ✅ Letterboxd-inspired UI with red theme
- ✅ Responsive design
- ✅ Secure API key handling (backend only)

## Troubleshooting

### Database Connection Error
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

### API Key Error
- Verify RAWG_API_KEY is set in server `.env`
- Check API key is valid at https://rawg.io/apidocs

### CORS Error
- Ensure server is running on port 3001
- Check CORS configuration in server.js
- Verify frontend URL matches CORS settings

### Port Already in Use
- Change PORT in server `.env`
- Update VITE_API_BASE_URL in client if needed

## Security Notes

- Never commit `.env` files
- Use strong JWT secrets in production
- Change default database passwords
- Use environment variables for all secrets
- API keys are now stored server-side only

## Production Deployment

1. Set `NODE_ENV=production` in server `.env`
2. Set `FRONTEND_URL` to your production frontend URL
3. Build the client: `cd client && npm run build`
4. Use a process manager like PM2 for the server
5. Use a reverse proxy like Nginx
6. Enable HTTPS
7. Set up proper database backups

## License

MIT

