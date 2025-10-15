import { MAIL, MAILER_USER } from "../config";
import { transporter } from "../connections/nodemailer";
import { ContactModel } from "../types";
import { confirmAPIKey } from "../utils/apiKey";

export const contactModel: ContactModel = {
    contact: async ({ name, email, message, key }) => {
        const apiKey = await confirmAPIKey(key);
        if(!apiKey) return undefined;
        await transporter.sendMail({
            from: `"No Reply" <${MAILER_USER}>`,
            to: MAIL,
            subject: `Contact mail from ${name} (${email})`,
            text: message
        });
        return {}
    }
}