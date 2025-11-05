import { createTransport } from "nodemailer";
import { API, MAILER_PASS, MAILER_USER } from "../config";

const timeout = 3 * 60 * 1000;

export const transporter = createTransport({
  host: "smtp.gmail.com",
  port: API ? 465 : 587,
  secure: !!API, // true for 465, false for other ports
  auth: {
    user: MAILER_USER,
    pass: MAILER_PASS
  },
  ...API && {
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: timeout,
    socketTimeout: timeout,
    greetingTimeout: timeout
  }
});

transporter.verify()
  .then(() => console.log("Ready for send emails"))
  .catch(e => console.error("Error configuring email:", e));