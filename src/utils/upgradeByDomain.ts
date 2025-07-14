import { Plan } from "../enums";
import { UserClass } from "../schemas/user";
import { Email } from "../types";

export const upgradeByDomain = async (email: Email) => {
    const [_, domain] = email.split("@");
    const user = await UserClass.findOne({ email });
    if(!user || [Plan.PREMIUM, Plan.INSTITUTIONAL].includes(user.plan)) return;
    const institution = await UserClass.findOne({ domain, plan: Plan.INSTITUTIONAL });
    if(!institution) return;
    user.plan = Plan.PREMIUM;
    await user.save();
};