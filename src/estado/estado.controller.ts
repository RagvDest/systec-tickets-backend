import { Body, Controller, Delete, Get, HttpException, Logger, Param, Patch, Post, Req, Res, Session } from "@nestjs/common";
import { validate } from 'class-validator';
import { Notificacion } from "src/notificacion/notificacion.entity";
import { NotificacionService } from "src/notificacion/notificacion.service";
import { RolService } from "src/rol/rol.service";
import { TicketService } from "src/ticket/ticket.service";
import { isDeepStrictEqual } from "util";
import { Comentario } from "./comentario.entity";
import { ComentarioCreateDto } from "./dto/comentario.create.dto";
import { EstadoCreateDto } from "./dto/estado.create.dto";
import { EstadoUpdateDto } from "./dto/estado.update.dto";
import { Estado } from "./estado.entity";
import { EstadoService } from "./estado.service";

var capitalize = require('capitalize')


@Controller('estado')
export class EstadoController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly estadoService: EstadoService,
    private readonly rolService:RolService,
    private readonly notiService:NotificacionService) {}

    private logger:Logger = new Logger('EstadoController');

    @Post('crear')
    async crearEstado(
        @Res() res,
        @Body('estado') estado:Estado,
        @Body('id_ticket') id_ticket:string,
        @Req() req
    ){
        let ticket;
        try {
            if(req.user.data.rol_id.r_rol==='Cliente'){
                res.status(401).send();
                return;
            } 
            ticket = await this.ticketService.findByID(id_ticket);
            if(ticket==null){
                res.status(400).send('Ticket no existe');
                return;
            }
            let param = {ticket_id:id_ticket};
            let lastEstado = await this.estadoService.findLast(param);
            
            let estadoDto = new EstadoCreateDto();
            estadoDto.e_nombre = estado.e_nombre;
            estadoDto.e_detalle = estado.e_detalle;
            estadoDto.e_secuencial = lastEstado==null ? 0 : lastEstado.e_secuencial+1;
            estadoDto.id_ticket = ticket;
            estadoDto.tecnico_id = estado.user_id;

            estado.e_secuencial = lastEstado==null ? 0 : lastEstado.e_secuencial+1;
            estado.ticket_id = ticket;

            const errores = await validate(estadoDto);
            
            if(errores.length>0){
                console.error(errores);
                res.status(400).send("Error registrar con los datos proporcionados");
                return ;
            }
            const estadoCreado = await this.estadoService.create(estado);
            const ticketAc = await this.ticketService.updateEstado(ticket["_id"],estado.e_nombre);
            ticketAc.t_estado = estado.e_nombre;

            let notifiCreada = await this.notiService.generateNotifi(
                "Ticket",ticketAc.t_num,
                "Avance",ticketAc.pedido_id.usuario_id,
                ticketAc.pedido_id);

            res.send({estado:estadoCreado,ticket:ticketAc,notificacion:notifiCreada});
        } catch (error) {
            let code = 500, message = "Error registrar con los datos proporcionados";
            switch (error.name){
                case "CastError":{
                    code=400;
                    message="Datos inválido"
                    break;
                }
            }
            this.logger.error(error);
            res.status(code).send(message);
        }
    }

    @Patch('update/:idEstado')
    async actualizarEstado(
        @Res() res,
        @Body('comentario') comentario:Comentario,
        @Param('idEstado') id_estado,
        @Req() req
    ){
        try {
            const estadoEncontrado = await this.estadoService.findByID(id_estado);
            let estado = estadoEncontrado;
            if(estado==null){
                res.status(400).send({error:'Estado no existe'});
                throw new Error('Estado no encontrado');
            }

            const estadoDto = new EstadoUpdateDto();
            estadoDto.e_nombre = estado.e_nombre;
            estadoDto.e_detalle = estado.e_detalle;
            estadoDto.e_secuencial = estado.e_secuencial;
            estadoDto.e_comentarios = estado.e_comentarios;
            estadoDto.id_ticket = estado.ticket_id;
            estadoDto.tecnico_id = estado.user_id;

            const comentarioDto = new ComentarioCreateDto();
            comentarioDto.c_detalle = comentario.c_detalle;
            comentarioDto.c_usuario = comentario.c_usuario;
            comentarioDto.user_id = comentario.user_id;

            estado.e_comentarios.push(comentario);
            

            const errores = await validate(estadoDto);
            const erroresComent = await validate(comentarioDto);
            if(errores.length>0 || erroresComent.length>0){
                console.error(errores);
                res.status(400).send('Datos inválidos');
                return;
            }
            const estadoActualizado = await this.estadoService.updateByID(estadoEncontrado['_id'],estado);

            let notifi = await this.notifiComentario(
                req.user.data.rol_id,estado.user_id,
                estado.ticket_id,estadoEncontrado.ticket_id.pedido_id);

            res.send({estado:Object.assign(estadoActualizado, estado), comentario:comentario,notificacion:notifi});            
        } catch (error) {
            let code = 500, message = "Error registrar con los datos proporcionados";
            switch (error.name){
                case "CastError":{
                    code=400;
                    message="Datos inválido"
                    break;
                }
            }
            this.logger.error(error);
            res.status(code).send(message);
        }
    }

    @Get('all/:idTicket')
    async buscarTodos(
        @Res() res,
        @Param('idTicket') ticket_id
    ){
        try {
            const estadosEncontrado = await this.estadoService.findByTicketID({ticket_id:ticket_id});
            estadosEncontrado.map((it)=>{
                it.e_usuario = capitalize.words(it.e_usuario);
            })
            res.send({estado:estadosEncontrado,ticket:null});
        } catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    }

    @Get('comentarios/:idEstado')
    async buscarPrueba(
        @Res() res,
        @Param('idEstado') estado_id,
    ){
        try {
            
            let comentarios = [];
            let estado = await this.estadoService.findByID(estado_id);
            if(estado!=null){
                comentarios = estado.e_comentarios;
            }    
            res.send(comentarios);
        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    }

    @Delete('del/:idEstado')
    async eliminarEstado(
        @Res() res,
        @Req() req,
        @Param('idEstado') idEstado
    ){
        try {
            if(req.user.data.rol_id.r_rol==='Cliente'){
                res.status(401).send();
                return;
            } 
            let estadoEliminado = await this.estadoService.deleteEstado(idEstado);
            res.status(200).send(estadoEliminado);
        } catch (error) {
            this.logger.error('Delete: '+error);
            res.status(500).send('Error eliminando registro');
        }
    }

    async notifiComentario(
        rol,
        id_tec,
        idTicket,
        pedido
    ){
        let ticket = await this.ticketService.findByID(idTicket);
        if(rol.r_rol=='Cliente'){
            return await this.notiService.generateNotifi("Ticket",ticket.t_num,"Comentario",id_tec,pedido);
        }else{
            return await this.notiService.generateNotifi("Ticket",ticket.t_num,"Comentario",ticket.pedido_id.usuario_id,pedido);
        }
    }

}
