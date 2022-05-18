import { Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Notificacion } from "./notificacion/notificacion.entity";


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
        let id = payload;
        let eventName = 'getNotificationFromServer';
        let mensaje = `Usuario ${client.id} conectado`;
        console.log(id);
        console.log(eventName);
        console.log(mensaje);
        client.to(id).emit(eventName,mensaje);
    }

    @SubscribeMessage('nuevaNotifi')
    handleNewNotification(client:Socket,payload):void{
        this.logger.log("Evento nueva notificación");
        let id = payload.usuario_id;
        let eventName = 'getNotificationFromServer';
        let mensaje = `${payload.n_tipo} en el ${payload.n_documento} con código: ${payload.n_codigo}`;
        console.log(id);
        console.log(eventName);
        console.log(mensaje);
        client.to(id).emit(eventName,mensaje);
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