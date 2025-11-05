import { createTransport } from "nodemailer";
import { MAILER_PASS, MAILER_USER } from "../config";

const timeout = 30 * 1000;

export const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // false para TLS
  auth: {
    user: MAILER_USER,
    pass: MAILER_PASS
  },
  tls: {
    rejectUnauthorized: false, // Permite certificados auto-firmados
    ciphers: 'SSLv3'
  },
  connectionTimeout: timeout,
  socketTimeout: timeout,
  greetingTimeout: timeout / 2,
  logger: true, // Para debug
  debug: true // Para ver logs detallados
});

transporter.verify()
  .then(() => console.log("Ready for send emails"))
  .catch(e => {
    console.error("Error configuring email:", e);
    console.error("Details:", e);
  });