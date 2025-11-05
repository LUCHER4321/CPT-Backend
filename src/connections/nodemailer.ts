import { createTransport } from "nodemailer";
import { MAILER_PASS, MAILER_USER } from "../config";

const timeout = 30 * 1000;

export const transporter = createTransport({
  service: "gmail",
  auth: {
    user: MAILER_USER,
    pass: MAILER_PASS
  },
  connectionTimeout: timeout,
  socketTimeout: timeout
});

transporter.verify()
  .then(() => console.log("Ready for send emails"))
  .catch(e => console.error("Error configuring email:", e));