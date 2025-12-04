const { transporter } = require('../config/nodemailer');

/**
 * Send OTP via email
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 */
const sendOTP = async (email, otp) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"LMS Support" <noreply@lms.com>',
      to: email,
      subject: 'Welcome to LMS! Verify your email',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; padding: 40px 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header with Logo -->
            <div style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #4F46E5;">
              <img src="https://hirelyft.in/Hirelyft.jpg" alt="LMS Logo" style="max-width: 180px; height: auto;">
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <h1 style="color: #1F2937; margin-top: 0; font-size: 24px; text-align: center;">Welcome to LMS! 🚀</h1>
              
              <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                Hello there,
              </p>
              <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                We're thrilled to have you on board! You are just one step away from accessing your personalized learning journey. Please verify your email address to get started.
              </p>

              <!-- OTP Box -->
              <div style="background-color: #E0E7FF; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                <p style="color: #4F46E5; font-size: 14px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                <h2 style="color: #3730A3; font-size: 32px; margin: 0; letter-spacing: 8px; font-weight: 700;">${otp}</h2>
              </div>

              <!-- Validity & Next Steps -->
              <div style="background-color: #F9FAFB; border-left: 4px solid #10B981; padding: 15px; margin-bottom: 30px;">
                <p style="margin: 0; color: #374151; font-size: 14px;">
                  <strong>⏳ Validity:</strong> This code expires in <span style="color: #EF4444; font-weight: bold;">10 minutes</span>.
                </p>
                <p style="margin: 10px 0 0 0; color: #374151; font-size: 14px;">
                  <strong>👉 Next Steps:</strong> Enter this code on the verification screen to activate your account and complete your profile setup.
                </p>
              </div>

              <p style="color: #6B7280; font-size: 14px; line-height: 1.5;">
                If you didn't create an account with LMS, you can safely ignore this email.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #1F2937; padding: 20px; text-align: center;">
              <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                &copy; ${new Date().getFullYear()} LMS. All rights reserved.
              </p>
              <p style="color: #6B7280; font-size: 12px; margin: 10px 0 0 0;">
                Need help? <a href="mailto:support@lms.com" style="color: #60A5FA; text-decoration: none;">Contact Support</a>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    // Don't throw error to prevent blocking registration flow, but log it
  }
};

module.exports = { sendOTP };
