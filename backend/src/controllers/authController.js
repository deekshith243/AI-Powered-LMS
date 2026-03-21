const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const user = { id: result.insertId, email, role: 'student' };
    const tokens = generateTokens(user);

    // Store the refresh token in the database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, tokens.refreshToken, expiresAt]
    );

    res.status(201).json({ user, ...tokens });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const tokens = generateTokens(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, tokens.refreshToken, expiresAt]
    );

    // ─── STREAK LOGIC ──────────────────────────────────────
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = user.last_login_date ? new Date(user.last_login_date).toISOString().split('T')[0] : null;
    
    let newStreak = user.streak || 0;
    
    if (!lastLogin) {
      newStreak = 1;
    } else if (lastLogin !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastLogin === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }
    
    // Update streak and last login
    await pool.query('UPDATE users SET streak = ?, last_login_date = ? WHERE id = ?', [newStreak, today, user.id]);
    // ───────────────────────────────────────────────────────

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, points: user.points, streak: newStreak },
      ...tokens
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

  try {
    // Check if token exists in database and is not expired
    const [tokens] = await pool.query('SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()', [refreshToken]);
    if (tokens.length === 0) return res.status(401).json({ message: 'Invalid or expired refresh token' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const [users] = await pool.query('SELECT id, email, role FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) return res.status(401).json({ message: 'User not found' });

    const newTokens = generateTokens(users[0]);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Replace old refresh token with new one
    await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [users[0].id, newTokens.refreshToken, expiresAt]
    );

    res.json(newTokens);
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await pool.query('SELECT name, email, points, streak FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = users[0];
    res.json({
      name: user.name || "User",
      email: user.email || "",
      points: user.points || 0,
      streak: user.streak || 0
    });
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
