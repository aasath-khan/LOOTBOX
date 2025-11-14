
// server.js
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'http://localhost:5173'
    : [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
      ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// --- IMPROVEMENT: Use a connection pool for resilience and efficiency ---
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// --- IMPROVEMENT: Helper function to avoid repeating code ---
const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};


// 📝 Check User Existence Route
app.post('/api/check-user', async (req, res) => {
  const { username } = req.body;
  try {
    const [results] = await pool.query('SELECT username FROM users WHERE username = ?', [username]);
    res.status(200).json({ exists: results.length > 0 });
  } catch (err) {
    console.error('Check user error:', err);
    res.status(500).json({ message: 'Server error during user check.' });
  }
});

// 📝 Register Route
app.post('/api/register', async (req, res) => {
  const { fullName, dob, email, username, password } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (full_name, dob, email, username, password_hash) VALUES (?, ?, ?, ?, ?)';
    
    // Get the newly created user's info to generate a proper token
    const [result] = await pool.query(query, [fullName, dob, email, username, passwordHash]);
    const newUser = { id: result.insertId, username: username };

    const token = generateToken(newUser);
    res.status(201).json({ message: 'User registered successfully!', token });

  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }
    res.status(500).json({ message: 'Registration failed due to a server error.' });
  }
});

// 📝 Login Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [results] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
      const token = generateToken(user);
      res.status(200).json({ message: 'Login successful!', token });
    } else {
      res.status(401).json({ message: 'Invalid username or password.' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// 🎮 Games API Routes (Proxy to RAWG API)
const RAWG_API_KEY = process.env.RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

if (!RAWG_API_KEY) {
  console.warn('Warning: RAWG_API_KEY not set in environment variables. Games API will not work.');
}

// Get games list (paginated)
app.get('/api/games', authenticateToken, async (req, res) => {
  try {
    if (!RAWG_API_KEY) {
      console.error('RAWG_API_KEY is not set in environment variables');
      return res.status(500).json({ message: 'API key not configured' });
    }

    const { page = 1, page_size = 20, search } = req.query;
    let url = `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&page=${page}&page_size=${page_size}`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    console.log(`Fetching games from RAWG API: ${url.replace(RAWG_API_KEY, '***')}`);

    // Check if fetch is available
    if (typeof fetch === 'undefined') {
      throw new Error('fetch is not available. Please use Node.js 18+ or install node-fetch');
    }

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    let response;
    try {
      response = await fetch(url, {
        signal: controller.signal
      });
      clearTimeout(timeoutId); // Clear timeout on successful fetch
    } catch (fetchError) {
      clearTimeout(timeoutId); // Clear timeout on error
      throw fetchError;
    }
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Unable to read error response';
      }
      
      console.error(`RAWG API error (${response.status}):`, errorText);
      console.error(`Request URL: ${url.replace(RAWG_API_KEY, '***')}`);
      
      // Provide more specific error messages
      let errorMessage = `RAWG API error: ${response.status}`;
      if (response.status === 401) {
        errorMessage = 'RAWG API key is invalid or expired';
      } else if (response.status === 429) {
        errorMessage = 'RAWG API rate limit exceeded. Please try again later.';
      } else if (response.status === 404) {
        errorMessage = 'RAWG API endpoint not found';
      } else if (errorText) {
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.detail) {
            errorMessage = `RAWG API error: ${errorJson.detail}`;
          } else {
            errorMessage = `RAWG API error: ${errorText.substring(0, 200)}`;
          }
        } catch {
          errorMessage = `RAWG API error: ${errorText.substring(0, 200)}`;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Games API error:', err);
    console.error('Error stack:', err.stack);
    console.error('Request parameters:', { page: req.query.page, page_size: req.query.page_size, search: req.query.search });
    
    // Handle timeout errors
    if (err.name === 'AbortError') {
      return res.status(504).json({ 
        message: 'Request timeout - RAWG API took too long to respond',
        error: 'The request to RAWG API timed out after 30 seconds'
      });
    }
    
    // Always include error details in development, conditionally in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    res.status(500).json({ 
      message: 'Failed to fetch games',
      error: isDevelopment ? err.message : (err.message.includes('rate limit') ? err.message : undefined)
    });
  }
});

// Get single game details
app.get('/api/games/:id', authenticateToken, async (req, res) => {
  try {
    if (!RAWG_API_KEY) {
      console.error('RAWG_API_KEY is not set in environment variables');
      return res.status(500).json({ message: 'API key not configured' });
    }

    const { id } = req.params;
    const url = `${RAWG_BASE_URL}/games/${id}?key=${RAWG_API_KEY}`;
    
    console.log(`Fetching game details from RAWG API: ${url.replace(RAWG_API_KEY, '***')}`);

    // Check if fetch is available
    if (typeof fetch === 'undefined') {
      throw new Error('fetch is not available. Please use Node.js 18+ or install node-fetch');
    }

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    let response;
    try {
      response = await fetch(url, {
        signal: controller.signal
      });
      clearTimeout(timeoutId); // Clear timeout on successful fetch
    } catch (fetchError) {
      clearTimeout(timeoutId); // Clear timeout on error
      throw fetchError;
    }
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Unable to read error response';
      }
      
      console.error(`RAWG API error (${response.status}):`, errorText);
      
      // Provide more specific error messages
      let errorMessage = `RAWG API error: ${response.status}`;
      if (response.status === 401) {
        errorMessage = 'RAWG API key is invalid or expired';
      } else if (response.status === 429) {
        errorMessage = 'RAWG API rate limit exceeded. Please try again later.';
      } else if (errorText) {
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.detail) {
            errorMessage = `RAWG API error: ${errorJson.detail}`;
          } else {
            errorMessage = `RAWG API error: ${errorText.substring(0, 200)}`;
          }
        } catch {
          errorMessage = `RAWG API error: ${errorText.substring(0, 200)}`;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Game detail API error:', err);
    console.error('Error stack:', err.stack);
    console.error('Game ID:', req.params.id);
    
    // Handle timeout errors
    if (err.name === 'AbortError') {
      return res.status(504).json({ 
        message: 'Request timeout - RAWG API took too long to respond',
        error: 'The request to RAWG API timed out after 30 seconds'
      });
    }
    
    // Always include error details in development, conditionally in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    res.status(500).json({ 
      message: 'Failed to fetch game details',
      error: isDevelopment ? err.message : (err.message.includes('rate limit') ? err.message : undefined)
    });
  }
});

// Startup checks
console.log('=== Server Startup Checks ===');
console.log('Node.js version:', process.version);
console.log('Fetch available:', typeof fetch !== 'undefined' ? 'Yes' : 'No');
console.log('RAWG_API_KEY set:', RAWG_API_KEY ? 'Yes (hidden)' : 'No - REQUIRED!');
console.log('DB_HOST:', process.env.DB_HOST || 'Not set');
console.log('DB_NAME:', process.env.DB_NAME || 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set (hidden)' : 'Not set - REQUIRED!');
console.log('============================');

if (!RAWG_API_KEY) {
  console.error('⚠️  WARNING: RAWG_API_KEY is not set! Games API will not work.');
}

if (!process.env.JWT_SECRET) {
  console.error('⚠️  WARNING: JWT_SECRET is not set! Authentication will not work.');
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});