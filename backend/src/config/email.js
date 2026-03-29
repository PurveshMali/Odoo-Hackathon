const nodemailer = require('nodemailer');

/**
 * Creates a nodemailer transporter.
 * In development: uses Ethereal (fake SMTP — logs preview URL to console).
 * In production:  uses Gmail with app password from env.
 */
const createTransporter = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host:   'smtp.ethereal.email',
      port:   587,
      secure: false,
      auth:   { user: testAccount.user, pass: testAccount.pass },
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM_ADDRESS,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

/**
 * Sends login credentials to a newly provisioned user.
 * @param {{ toEmail, userName, password, companyName, loginUrl }} params
 */
const sendCredentialsEmail = async ({ toEmail, userName, password, companyName, loginUrl }) => {
  const transporter = await createTransporter();

  const mailOptions = {
    from:    `"${companyName}" <${process.env.EMAIL_FROM_ADDRESS || 'noreply@expensio.com'}>`,
    to:      toEmail,
    subject: `Your Login Credentials — ${companyName}`,
    text: `
Hi ${userName},

Your account has been set up on the ${companyName} Reimbursement System.

Here are your login credentials:

  Email:    ${toEmail}
  Password: ${password}

Login here: ${loginUrl}

IMPORTANT: You will be required to change your password on first login.

If you did not expect this email, contact your administrator.

— ${companyName} Admin Team
    `.trim(),

    html: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;">
  <div style="background:#4F46E5;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:24px;">Welcome to ${companyName}</h1>
  </div>
  <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
    <p>Hi <strong>${userName}</strong>,</p>
    <p>Your account has been set up on the <strong>${companyName}</strong> Reimbursement System. Here are your login credentials:</p>

    <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #e5e7eb;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#6b7280;width:100px;font-size:14px;">Email</td>
          <td style="padding:8px 0;font-weight:bold;">${toEmail}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:14px;">Password</td>
          <td style="padding:8px 0;">
            <code style="background:#e0e0e0;padding:4px 10px;border-radius:4px;font-size:16px;letter-spacing:2px;font-family:monospace;">${password}</code>
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;margin:30px 0;">
      <a href="${loginUrl}"
         style="background:#4F46E5;color:white;padding:12px 32px;text-decoration:none;border-radius:8px;font-size:16px;font-weight:bold;display:inline-block;">
        Login Now →
      </a>
    </div>

    <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:14px;margin:20px 0;">
      <strong>⚠️ Important:</strong> You will be required to change your password immediately after first login. Please do so right away.
    </div>

    <p style="color:#9ca3af;font-size:12px;">If you did not expect this email, please contact your administrator immediately.</p>
  </div>
</body>
</html>
    `.trim(),
  };

  const info = await transporter.sendMail(mailOptions);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`📧 Credentials Email Preview: ${nodemailer.getTestMessageUrl(info)}`);
  }

  return info;
};

/**
 * Sends a password-changed confirmation email.
 * @param {{ toEmail, userName }} params
 */
const sendPasswordChangedEmail = async ({ toEmail, userName }) => {
  const transporter = await createTransporter();

  const mailOptions = {
    from:    `"Expensio" <${process.env.EMAIL_FROM_ADDRESS || 'noreply@expensio.com'}>`,
    to:      toEmail,
    subject: 'Your password has been changed',
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;">
  <div style="background:#10B981;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:22px;">✅ Password Changed Successfully</h1>
  </div>
  <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
    <p>Hi <strong>${userName}</strong>,</p>
    <p>Your password was successfully updated. You can now log in with your new password.</p>
    <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:14px;margin:20px 0;">
      <strong style="color:#dc2626;">If you did not make this change, contact your administrator immediately.</strong>
    </div>
    <p style="color:#9ca3af;font-size:12px;">This is an automated message from the Expensio Reimbursement System.</p>
  </div>
</body>
</html>
    `.trim(),
  };

  const info = await transporter.sendMail(mailOptions);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`📧 Password Changed Email Preview: ${nodemailer.getTestMessageUrl(info)}`);
  }
};

module.exports = { sendCredentialsEmail, sendPasswordChangedEmail };
