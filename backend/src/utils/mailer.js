const nodemailer = require('nodemailer');

const isConfigured = !!(process.env.MAIL_USER && process.env.MAIL_PASS);

const transporter = isConfigured
  ? nodemailer.createTransport({
      host:   process.env.MAIL_HOST || 'smtp.gmail.com',
      port:   parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    })
  : null;

const sendOtpEmail = async (email, username, otp) => {
  if (!isConfigured) return { skipped: true };

  const digits = String(otp).split('');
  const digitBoxes = digits.map(d =>
    `<span style="display:inline-block;width:52px;height:64px;line-height:64px;text-align:center;font-size:32px;font-weight:900;background:#f0f2ff;border:2px solid #c7d2fe;border-radius:10px;margin:0 4px;color:#3730a3;letter-spacing:0">${d}</span>`
  ).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:white;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.12)">

        <tr><td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4338ca 100%);padding:32px 40px;text-align:center">
          <div style="font-size:40px;margin-bottom:8px">📚</div>
          <div style="font-size:22px;font-weight:800;color:#e8dcc8;letter-spacing:.08em">WORDSTRIDE</div>
          <div style="font-size:11px;color:rgba(232,220,200,.55);margin-top:4px;letter-spacing:.14em">✦ JOURNEY OF WORDS ✦</div>
        </td></tr>

        <tr><td style="padding:36px 40px;text-align:center">
          <h2 style="margin:0 0 6px;font-size:20px;font-weight:700;color:#1a1a2e">Mã xác thực OTP</h2>
          <p style="margin:0 0 28px;color:#6c757d;font-size:14px">
            Xin chào <strong>${username}</strong>! Nhập mã dưới đây để xác thực tài khoản.
          </p>

          <div style="background:#f5f7ff;border:2px solid #e0e7ff;border-radius:16px;padding:28px 20px;margin-bottom:24px;display:inline-block;width:100%;box-sizing:border-box">
            <div style="margin-bottom:8px;font-size:12px;font-weight:700;color:#6366f1;letter-spacing:.12em;text-transform:uppercase">Mã xác thực của bạn</div>
            <div style="margin:12px 0">${digitBoxes}</div>
            <div style="font-size:12px;color:#94a3b8;margin-top:12px">⏰ Hết hạn sau <strong>10 phút</strong></div>
          </div>

          <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.7">
            Không đăng ký tài khoản này? Hãy bỏ qua email này.<br/>
            Không chia sẻ mã OTP với bất kỳ ai.
          </p>
        </td></tr>

        <tr><td style="background:#f8f9fa;padding:14px 40px;text-align:center;border-top:1px solid #f0f0f0">
          <p style="margin:0;color:#adb5bd;font-size:11px">© ${new Date().getFullYear()} WordStride</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from:    `"WordStride" <${process.env.MAIL_USER}>`,
    to:      email,
    subject: `${otp} là mã OTP WordStride của bạn`,
    html,
  });

  return { sent: true };
};

// Keep alias for backward compat
const sendVerificationEmail = sendOtpEmail;

module.exports = { sendOtpEmail, sendVerificationEmail, isConfigured };
