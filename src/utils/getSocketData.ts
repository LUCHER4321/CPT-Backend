import { Socket } from "socket.io";

export const getSocketData = (socket: Socket) => {
    const { data, handshake, emit } = socket;
    const { cookie } = handshake.headers;
    const [_, token] = cookie?.split("=") ?? [undefined, undefined];
    return {
        data,
        emit,
        token
    };
}