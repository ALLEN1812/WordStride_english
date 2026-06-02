const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const { pool } = require('../config/db');
const { sendOtpEmail, isConfigured } = require('../utils/mailer');

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// 6-digit numeric OTP
const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

// POST /api/auth/register
const register = async (req, res) => {
  const { username, email, password, full_name } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ success: false, message: 'Email không hợp lệ' });

  if (password.length < 6)
    return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' });

  try {
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ?', [email, username]
    );
    if (existing.length > 0)
      return res.status(409).json({ success: false, message: 'Email hoặc tên đăng nhập đã tồn tại' });

    const hashed = await bcrypt.hash(password, 10);

    // Always require OTP verification
    const otp    = generateOTP();
    const otpExp = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, full_name, email_verified, email_token, email_token_exp) VALUES (?, ?, ?, ?, 0, ?, ?)',
      [username, email, hashed, full_name || null, otp, otpExp]
    );

    const isDev = process.env.NODE_ENV !== 'production';

    if (isConfigured) {
      try {
        await sendOtpEmail(email, username, otp);
      } catch (mailErr) {
        console.error('⚠️  Mail error:', mailErr.message);
      }
    } else {
      // Dev mode: log OTP to console
      console.log(`\n📧 [DEV] OTP cho ${email}: \x1b[33m${otp}\x1b[0m\n`);
    }

    return res.status(201).json({
      success: true,
      message: isConfigured
        ? 'Đăng ký thành công! Nhập mã OTP được gửi đến email của bạn.'
        : `Đăng ký thành công! (Dev mode) Mã OTP: ${otp}`,
      data: {
        requiresVerification: true,
        email,
        // Expose OTP in dev mode so frontend can prefill
        ...(isDev && !isConfigured ? { devOtp: otp } : {}),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length)
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });

    const user = rows[0];

    if (!user.is_active)
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa bởi quản trị viên' });

    if (!user.email_verified)
      return res.status(403).json({
        success: false,
        message: 'Email chưa được xác thực. Vui lòng kiểm tra hộp thư và xác thực tài khoản.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });

    const token = generateToken(user);
    const { password: _, email_token: __, email_token_exp: ___, ...userData } = user;
    return res.json({ success: true, message: 'Đăng nhập thành công', data: userData, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mã OTP' });

  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, role FROM users WHERE email = ? AND email_token = ? AND email_token_exp > NOW()',
      [email, String(otp).trim()]
    );
    if (!rows.length) {
      // Check if OTP is correct but expired
      const [expRows] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND email_token = ?', [email, String(otp).trim()]
      );
      if (expRows.length)
        return res.status(400).json({ success: false, message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.', code: 'OTP_EXPIRED' });
      return res.status(400).json({ success: false, message: 'Mã OTP không đúng. Vui lòng thử lại.', code: 'OTP_WRONG' });
    }

    const user = rows[0];
    await pool.query(
      'UPDATE users SET email_verified = 1, email_token = NULL, email_token_exp = NULL WHERE id = ?',
      [user.id]
    );

    const token = generateToken(user);
    return res.json({
      success: true,
      message: 'Xác thực thành công! Chào mừng bạn đến với WordStride.',
      data: { id: user.id, username: user.username, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: 'Vui lòng nhập email' });

  try {
    const [rows] = await pool.query(
      'SELECT id, username, email_verified FROM users WHERE email = ?', [email]
    );
    if (!rows.length || rows[0].email_verified)
      return res.json({ success: true, message: 'Nếu email tồn tại và chưa xác thực, OTP mới đã được gửi.' });

    const user   = rows[0];
    const newOtp = generateOTP();
    const newExp = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      'UPDATE users SET email_token = ?, email_token_exp = ? WHERE id = ?',
      [newOtp, newExp, user.id]
    );

    const isDev = process.env.NODE_ENV !== 'production';
    if (isConfigured) {
      await sendOtpEmail(email, user.username, newOtp);
    } else {
      console.log(`\n📧 [DEV] OTP mới cho ${email}: \x1b[33m${newOtp}\x1b[0m\n`);
    }

    return res.json({
      success: true,
      message: isConfigured ? 'Mã OTP mới đã được gửi đến email của bạn.' : `(Dev) Mã OTP mới: ${newOtp}`,
      ...(isDev && !isConfigured ? { devOtp: newOtp } : {}),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, full_name, avatar, dob, role, is_active, email_verified, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin' });
  if (newPassword.length < 6)
    return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });

  try {
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    return res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { register, login, verifyOTP, resendOTP, getMe, changePassword };
