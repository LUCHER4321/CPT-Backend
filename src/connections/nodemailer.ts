import { createTransport } from "nodemailer";
import { MAILER_PASS, MAILER_USER } from "../config";

export const transporter = createTransport({
  service: "Gmail",
  auth: {
    user: MAILER_USER,
    pass: MAILER_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify()
  .then(() => console.log("Ready for send emails"))
  .catch(e => {
    console.error("Error configuring email:", (e as Error).message);
    console.error("Details:", e);
  });