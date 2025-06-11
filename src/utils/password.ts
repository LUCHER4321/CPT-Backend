import { compare, hash } from "bcrypt";

export const encryptPassword = async (password: string) => {
    const hashedPass = await hash(password, 10);
    return hashedPass;
};

export const comparePassword = async (password: string, hashedPassword: string) => {
    const isMatch = await compare(password, hashedPassword);
    return isMatch;
};