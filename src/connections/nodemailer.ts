import { createTransport } from "nodemailer";
import { API, MAILER_PASS, MAILER_USER } from "../config";

export const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: MAILER_USER,
    pass: MAILER_PASS
  },
  tls: API ? {
    rejectUnauthorized: false
  } : undefined
});

transporter.verify()
  .then(() => console.log("Ready for send emails"))
  .catch(e => console.error("Error configuring email:", e));