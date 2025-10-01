import { Server as SocketServer } from 'socket.io';
declare const io: SocketServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
declare global {
    var socketIO: SocketServer;
}
export { io };
//# sourceMappingURL=server.d.ts.map