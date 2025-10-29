import { MAIL, MAILER_USER } from "../config"
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

interface WelcomeMailProps {
    user: Promise<User | undefined>;
}

export const sendWelcomeMail = async ({
    user
}: WelcomeMailProps) => {
    const {
        email,
        username
    } = (await user) ?? {};
    if(!email || !username) throw new Error("Missing user");
    
    await transporter.sendMail({
        from: `"No Reply" <${MAILER_USER}>`,
        to: email,
        subject: `Welcome to Life Tree, ${username}! 🌳`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2E8B57 0%, #3CB371 100%); padding: 30px 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Life Tree!</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Start creating your phylogenetic trees today</p>
            </div>
            
            <div style="padding: 30px; background-color: #f9f9f9;">
                <h2 style="color: #2E8B57; margin-top: 0;">Hello, ${username}! 👋</h2>
                
                <p style="color: #555; line-height: 1.6; font-size: 16px;">
                    Thank you for joining <strong>Life Tree</strong>! We're excited to have you as part of our community 
                    of biologists, researchers, and science enthusiasts.
                </p>
                
                <div style="background-color: white; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #3CB371;">
                    <h3 style="color: #2E8B57; margin-top: 0;">Get Started:</h3>
                    <ul style="color: #555; line-height: 1.8;">
                        <li><strong>Create your first tree</strong> - Build phylogenetic trees with our intuitive editor</li>
                        <li><strong>Add species</strong> - Populate your trees with detailed species information</li>
                        <li><strong>Collaborate</strong> - Invite others to work on trees together</li>
                        <li><strong>Explore</strong> - Discover trees created by our community</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://lifetreecreator.netlify.app/" 
                       style="background-color: #2E8B57; 
                              color: white; 
                              padding: 14px 30px; 
                              text-decoration: none; 
                              border-radius: 5px; 
                              font-weight: bold;
                              font-size: 16px;
                              display: inline-block;
                              transition: background-color 0.3s;">
                        Start Creating Now
                    </a>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin: 30px 0; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 150px; margin: 10px; text-align: center;">
                        <div style="background-color: #E8F5E8; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">
                            <span style="font-size: 24px;">🌿</span>
                        </div>
                        <p style="color: #555; margin: 0; font-size: 14px;">Build Evolutionary Trees</p>
                    </div>
                    <div style="flex: 1; min-width: 150px; margin: 10px; text-align: center;">
                        <div style="background-color: #E8F5E8; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">
                            <span style="font-size: 24px;">🤝</span>
                        </div>
                        <p style="color: #555; margin: 0; font-size: 14px;">Collaborate with Others</p>
                    </div>
                    <div style="flex: 1; min-width: 150px; margin: 10px; text-align: center;">
                        <div style="background-color: #E8F5E8; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">
                            <span style="font-size: 24px;">🔬</span>
                        </div>
                        <p style="color: #555; margin: 0; font-size: 14px;">Scientific Visualization</p>
                    </div>
                </div>
                
                <div style="margin-top: 25px; padding: 15px; background-color: #E8F5E8; border-radius: 8px;">
                    <h4 style="color: #2E8B57; margin-top: 0;">Need Help?</h4>
                    <p style="color: #555; margin: 0; font-size: 14px;">
                        Check out our documentation, join our <a href="https://discord.gg/s9cJJHcnA4" style="color: #3CB371; text-decoration: none;">Discord community</a>, or contact our support team at 
                        <a href="mailto:${MAIL}" style="color: #2E8B57;">${MAIL}</a>
                    </p>
                </div>
            </div>
            
            <div style="background-color: #2d5a2d; padding: 20px; text-align: center; font-size: 12px; color: #ccc;">
                <p style="margin: 0 0 10px 0;">
                    You're receiving this email because you recently created a new Life Tree account.
                </p>
                <p style="margin: 0;">
                    &copy; ${new Date().getFullYear()} Life Tree. All rights reserved.<br>
                    <a href="https://lifetreecreator.netlify.app/" style="color: #3CB371; text-decoration: none;">Visit our website</a> | 
                    <a href="mailto:${MAIL}" style="color: #3CB371; text-decoration: none;">Contact Support</a>
                </p>
            </div>
        </div>
        `
    });
}