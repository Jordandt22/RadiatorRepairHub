import { Resend } from "resend";

let resend = null;
export const resendClient = () => {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};