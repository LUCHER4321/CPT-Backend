import { ContactController, ContactModel } from "../types";
import { getKey, parseContact } from "../utils/parser";

export const contactController = ({
    contactModel
}: { contactModel: ContactModel }): ContactController => ({
    contact: async (req, res) => {
        const { apiKey } = req.query;
        const key = getKey(apiKey);
        try {
            const body = parseContact(req.body);
            await contactModel.contact({
                ...body,
                key
            });
            res.json({ message: "Message sent successfully" });
        } catch(e) {
            res.status(400).json({ error: (e as Error).message });
        }
    }
});