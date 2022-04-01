import { Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";


@WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{

    @WebSocketServer() server: Server;
    private logger:Logger = new Logger('AppGateway');

    private users = new Map();

    @SubscribeMessage('connected')
    handleConnected(client: Socket, payload:string):void {
        this.logger.log(`Client whit ID ${payload} registered`);
        client.join(payload);
    }

    @SubscribeMessage('notificacion')
    handleNotificacion(client: Socket, payload:string):void{
        this.logger.log("Evento Notificacion");
        client.to(payload).emit('getNotificationFromServer',
        `Usuario ${client.id} conectado`);
    }


    afterInit(server: Server) {
        this.logger.log('Init');
    }

    handleDisconnect(client: Socket) {
        this.users.delete(client);
        this.logger.log(`Client disconnected: ${client.id}`)
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }

}