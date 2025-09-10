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
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
  })
);
app.use(express.json()); // Modern replacement for body-parser

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});