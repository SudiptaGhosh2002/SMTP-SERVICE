import nodemailer from "nodemailer";
import transporter from "./Email.config.js";

const sendVerificationCode= async (email, verificationCode,firstname)=>{
    try {
        const info = await transporter.sendMail({
    from: '"Sudipto.co" <sudipto.ghosh360@gmail.com>',
    to: email,
    subject: "verification Code ✔",
    text: `Your verification code is: ${verificationCode}`, // plain‑text body
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background-color: #4A90E2; color: #ffffff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Email Verification</h1>
        </div>
        <div style="padding: 30px 20px;">
          <h2 style="font-size: 20px; color: #333;">Hello!${firstname}</h2>
          <p style="font-size: 16px;">Thank you for registering. Please use the following code to verify your email address.</p>
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 18px; font-weight: bold; color: #555;">Your verification code is:</p>
            <div style="background-color: #e9e9e9; border-radius: 5px; display: inline-block; padding: 10px 20px; margin-top: 10px;">
              <strong style="font-size: 28px; color: #2a2a2a; letter-spacing: 4px;">${verificationCode}</strong>
            </div>
          </div>
          <p style="font-size: 16px;">If you did not request this code, you can safely ignore this email.</p>
          <p style="font-size: 16px;">Thanks,<br>The Your Company Team</p>
        </div>
        <div style="background-color: #f8f8f8; color: #888; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          <p style="margin: 5px 0 0;">123 Main Street, Anytown, USA</p>
        </div>
      </div>
    </div>
    `, // HTML body
  });

  console.log("Message sent: %s", info.messageId);
        // Preview URL will be available in the console when an email is sent
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending email:", error);
    }
};


 

const sendWelcomeEmail = async (email, firstName) => {
  try {
    const info = await transporter.sendMail({
      from: '"Sudipto.co" <sudipto.ghosh360@gmail.com>',
      to: email,
      subject: "Welcome to Sudipto.co 🎉",
      text: `Hi ${firstName},

Welcome to Sudipto.co! Your email has been successfully verified.

We’re excited to have you on board.

– Team Sudipto.co`,
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          
          <div style="background: #4A90E2; color: #ffffff; padding: 25px; text-align: center;">
            <h1>Welcome, ${firstName}! 🎉</h1>
          </div>

          <div style="padding: 30px;">
            <p style="font-size: 16px;">
              Your email has been <strong>successfully verified</strong>.
            </p>

            <p style="font-size: 16px;">
              You can now log in and start using all features of Sudipto.co.
            </p>

            <p style="margin-top: 25px;">
              Cheers,<br>
              <strong>Team Sudipto.co</strong>
            </p>
          </div>

          <div style="background: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #888;">
            © ${new Date().getFullYear()} Sudipto.co
          </div>
        </div>
      </div>
      `,
    });

    console.log("Welcome email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

const sendPasswordResetEmail = async (email, resetToken, firstName) => {
    try {
        // Create reset URL (frontend URL + token)
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        
        const info = await transporter.sendMail({
            from: '"Sudipto.co" <sudipto.ghosh360@gmail.com>',
            to: email,
            subject: "Password Reset Request 🔐",
            text: `Hi ${firstName},

You requested to reset your password. Please click the link below to reset your password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email and your password will remain unchanged.

Thanks,
Team Sudipto.co`,
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
                    <div style="background-color: #4A90E2; color: #ffffff; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">Password Reset</h1>
                    </div>
                    <div style="padding: 30px 20px;">
                        <h2 style="font-size: 20px; color: #333;">Hello ${firstName}!</h2>
                        <p style="font-size: 16px;">You requested to reset your password. Click the button below to create a new password:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                                Reset Your Password
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666;">
                            Or copy and paste this link in your browser:<br>
                            <a href="${resetUrl}" style="color: #4A90E2; word-break: break-all;">${resetUrl}</a>
                        </p>
                        
                        <p style="font-size: 14px; color: #ff6b6b; font-weight: bold;">
                            ⚠️ This link will expire in 1 hour.
                        </p>
                        
                        <p style="font-size: 14px; color: #666;">
                            If you didn't request a password reset, you can safely ignore this email.
                        </p>
                        
                        <p style="font-size: 16px; margin-top: 30px;">
                            Thanks,<br>
                            <strong>The Sudipto.co Team</strong>
                        </p>
                    </div>
                    <div style="background-color: #f8f8f8; color: #888; padding: 15px; text-align: center; font-size: 12px;">
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Sudipto.co. All rights reserved.</p>
                    </div>
                </div>
            </div>
            `,
        });

        console.log("Password reset email sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw error;
    }
};

const sendPasswordChangedEmail = async (email, firstName) => {
    try {
        const info = await transporter.sendMail({
            from: '"Sudipto.co" <sudipto.ghosh360@gmail.com>',
            to: email,
            subject: "Password Changed Successfully ✅",
            text: `Hi ${firstName},

Your password has been successfully changed.

If you did not make this change, please contact our support team immediately.

Thanks,
Team Sudipto.co`,
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
                    <div style="background-color: #27ae60; color: #ffffff; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">Password Updated</h1>
                    </div>
                    <div style="padding: 30px 20px;">
                        <h2 style="font-size: 20px; color: #333;">Hello ${firstName}!</h2>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="width: 80px; height: 80px; background-color: #27ae60; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                                <span style="color: white; font-size: 40px;">✓</span>
                            </div>
                        </div>
                        
                        <p style="font-size: 16px; text-align: center;">
                            Your password has been <strong>successfully changed</strong>.
                        </p>
                        
                        <div style="background-color: #f8f9fa; border-left: 4px solid #27ae60; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px; color: #666;">
                                <strong>Security Tip:</strong> If you did not make this change, please contact our support team immediately.
                            </p>
                        </div>
                        
                        <p style="font-size: 16px; margin-top: 30px;">
                            Thanks,<br>
                            <strong>The Sudipto.co Team</strong>
                        </p>
                    </div>
                    <div style="background-color: #f8f8f8; color: #888; padding: 15px; text-align: center; font-size: 12px;">
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Sudipto.co. All rights reserved.</p>
                    </div>
                </div>
            </div>
            `,
        });

        console.log("Password changed email sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending password changed email:", error);
        throw error;
    }
};

export { sendVerificationCode, sendWelcomeEmail, sendPasswordResetEmail, sendPasswordChangedEmail };
