const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw error;
    }
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Mental Health App</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #5A67D8 0%, #48BB78 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #5A67D8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌟 Welcome to Mental Health App</h1>
            <p>Your journey to better mental health starts here</p>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for joining our mental health community! To complete your registration and start your wellness journey, please verify your email address.</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace;">
              ${verificationUrl}
            </p>
            
            <p><strong>This link will expire in 24 hours.</strong></p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
            
            <h3>What's Next?</h3>
            <ul>
              <li>🏥 Connect with verified mental health professionals</li>
              <li>💬 Join our supportive anonymous community</li>
              <li>📊 Track your mood and build healthy habits</li>
              <li>🤖 Get 24/7 support from our AI companion</li>
            </ul>
          </div>
          <div class="footer">
            <p>If you didn't create an account, please ignore this email.</p>
            <p>© 2024 Mental Health App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, 'Verify Your Email - Mental Health App', html);
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Mental Health App</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #5A67D8 0%, #48BB78 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>Mental Health App</p>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password for your Mental Health App account. If you made this request, click the button below to reset your password.</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Important Security Information:</strong>
              <ul>
                <li>This link will expire in 10 minutes for your security</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
              </ul>
            </div>
            
            <p>For your security, we recommend:</p>
            <ul>
              <li>Using a strong, unique password</li>
              <li>Not sharing your password with anyone</li>
              <li>Logging out of shared devices</li>
            </ul>
          </div>
          <div class="footer">
            <p>If you're having trouble, contact our support team.</p>
            <p>© 2024 Mental Health App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, 'Reset Your Password - Mental Health App', html);
  }

  async sendWelcomeEmail(email, username) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Mental Health App</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #5A67D8 0%, #48BB78 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { display: flex; align-items: center; margin: 15px 0; }
          .feature-icon { font-size: 24px; margin-right: 15px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome, ${username}!</h1>
            <p>Your mental health journey begins now</p>
          </div>
          <div class="content">
            <h2>You're All Set!</h2>
            <p>Welcome to our supportive mental health community. We're here to help you every step of the way on your wellness journey.</p>
            
            <h3>🌟 Here's what you can do now:</h3>
            
            <div class="feature">
              <div class="feature-icon">💬</div>
              <div>
                <strong>Join the Forum</strong><br>
                Connect with others in our anonymous, supportive community
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">📊</div>
              <div>
                <strong>Track Your Mood</strong><br>
                Daily check-ins with personalized recommendations
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">🎯</div>
              <div>
                <strong>Build Healthy Habits</strong><br>
                Create and track habits that support your wellbeing
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">🤖</div>
              <div>
                <strong>Chat with AI Support</strong><br>
                24/7 guidance and emotional support when you need it
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">🏥</div>
              <div>
                <strong>Connect with Professionals</strong><br>
                Private, secure conversations with verified mental health experts
              </div>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
            
            <p><strong>Remember:</strong> Your privacy and anonymity are our top priorities. You're in control of what you share and with whom.</p>
            
            <p>If you ever need immediate help, don't hesitate to reach out to crisis support services in your area.</p>
          </div>
          <div class="footer">
            <p>Take care of yourself. You matter. 💚</p>
            <p>© 2024 Mental Health App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, 'Welcome to Mental Health App - Your Journey Begins!', html);
  }

  async sendDoctorApprovalEmail(email, username) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Approved - Mental Health App</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #48BB78 0%, #5A67D8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Account Approved!</h1>
            <p>Welcome to the Mental Health App Professional Network</p>
          </div>
          <div class="content">
            <h2>Congratulations, Dr. ${username}!</h2>
            <p>Your medical credentials have been verified and your account has been approved. You can now start helping patients on our platform.</p>
            
            <h3>🏥 As a verified professional, you can:</h3>
            <ul>
              <li>Respond to patient questions in our forum</li>
              <li>Engage in private, secure conversations with patients</li>
              <li>Provide professional guidance and support</li>
              <li>Access crisis alerts when patients need immediate help</li>
            </ul>
            
            <p><strong>Important Guidelines:</strong></p>
            <ul>
              <li>Always maintain professional boundaries</li>
              <li>Follow your local medical practice guidelines</li>
              <li>Escalate crisis situations appropriately</li>
              <li>Respect patient privacy and anonymity</li>
            </ul>
            
            <p>Thank you for joining our mission to make mental health support more accessible. Your expertise will make a real difference in people's lives.</p>
          </div>
          <div class="footer">
            <p>Together, we're building a more supportive world. 💚</p>
            <p>© 2024 Mental Health App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, 'Your Mental Health App Account Has Been Approved!', html);
  }
}

module.exports = new EmailService();