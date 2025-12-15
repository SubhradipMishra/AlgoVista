import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL || "mishrasubhradip2005@gmail.com",
    pass: process.env.SMTP_PASS || "enzgvicmxeywikjd",
  },
  logger: true,
  debug: true,
});

export const sendCredentialsMail = async (
  email: string,
  username: string,
  password: string
) => {
  const mailOptions = {
    from: `"AlgoVista" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Your AlgoVista Account Credentials",
    html: `
      <div style="background:#0A0F1A;padding:30px;color:#e5e5e5;font-family:Arial">
        <div style="max-width:600px;margin:auto;background:#0F172A;padding:30px;border-radius:12px;border:1px solid #1E293B">
          <h1 style="text-align:center;color:#3B82F6">
            👋 Welcome to AlgoVista
          </h1>

          <p>Hello <strong>${username}</strong>,</p>

          <p>Your account has been created successfully.</p>

          <div style="background:#1E293B;padding:20px;border-radius:10px">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>

          <p style="margin-top:20px">
            ⚠️ Please change your password after login.
          </p>

          <p style="text-align:center;color:#64748b;font-size:12px;margin-top:30px">
            © ${new Date().getFullYear()} AlgoVista
          </p>
        </div>
      </div>
    `,
  };

  await mailer.sendMail(mailOptions);
};
