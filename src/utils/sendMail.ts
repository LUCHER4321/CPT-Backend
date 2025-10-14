import { MAILER_USER } from "../config"
import { transporter } from "../connections/nodemailer"
import { User } from "../types";

interface SendMailProps {
    token: string;
    url: string
    user: Promise<User | undefined>;
}

export const sendMail = async ({
    token,
    url,
    user
}: SendMailProps) => {
    const {
        email,
        username
    } = (await user) ?? {};
    if(!email || !username) throw new Error("Missing user");
    const resetLink = `${url}/${token}`;
    await transporter.sendMail({
        from: `"No Reply" <${MAILER_USER}>`,
        to: email,
        subject: "Reset your password - Action required",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Reset Password</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #333;">Hello, ${username}</h2>
                
                <p style="color: #555; line-height: 1.6;">
                    We've received a request to reset your account password.
                    If you didn't make this request, you can ignore this message.
                </p>
                
                <p style="color: #555; line-height: 1.6;">
                    To create a new password, click the button below:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" 
                       style="background-color: #667eea; 
                              color: white; 
                              padding: 12px 24px; 
                              text-decoration: none; 
                              border-radius: 5px; 
                              font-weight: bold;
                              display: inline-block;">
                        Reset Password
                    </a>
                </div>
                
                <p style="color: #555; line-height: 1.6;">
                    Or copy and paste the following link into your browser:
                </p>
                
                <p style="background-color: #eee; padding: 10px; border-radius: 5px; word-break: break-all;">
                    <a href="${resetLink}" style="color: #667eea; text-decoration: none;">${resetLink}</a>
                </p>
                
                <div style="margin-top: 25px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                    <p style="color: #856404; margin: 0; font-size: 14px;">
                        <strong>Important:</strong> This link will expire in 1 hour for security reasons.
                    </p>
                </div>
                
                <p style="color: #777; font-size: 14px; margin-top: 25px;">
                    If you have trouble using the button above, please copy and paste the URL into your web browser.
                </p>
            </div>
            
            <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                <p style="margin: 0;">
                    This is an automated message, please do not reply to this email.
                    <br>
                    If you need help, please contact our support team.
                </p>
            </div>
        </div>
        `
    });
}