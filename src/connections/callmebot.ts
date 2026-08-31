import { CMB_API_KEY, PHONE } from "../config";

export const sendWhatsApp = (message: string) => `https://api.callmebot.com/whatsapp.php?phone=${PHONE}&text=${encodeURIComponent(message)}&apikey=${CMB_API_KEY}`;