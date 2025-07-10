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
    await transporter.sendMail({
        from: `"No Reply" <${MAILER_USER}>`,
        to: email,
        subject: "Forgot Password ✔",
        html: `
        <h3>Hi, ${username}</h3>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <a href="${url}/${token}">Verification Link</a>
        `, // HTML body
    });
}