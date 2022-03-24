import { Body, Controller, Get, HttpException, Param, Patch, Post, Res, Session } from "@nestjs/common";
import { validate } from 'class-validator';
import { TicketService } from "src/ticket/ticket.service";
import { Comentario } from "./comentario.entity";
import { EstadoCreateDto } from "./dto/estado.create.dto";
import { EstadoUpdateDto } from "./dto/estado.update.dto";
import { Estado } from "./estado.entity";
import { EstadoService } from "./estado.service";

@Controller('estado')
export class EstadoController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly estadoService: EstadoService) {}

    @Post('crear')
    async crearEstado(
        @Res() res,
        @Body('estado') estado:Estado,
        @Body('id_ticket') id_ticket:string,
        @Session() session
    ){
        let ticket;
        try {
            ticket = await this.ticketService.findByID(id_ticket);
            if(ticket==null){
                res.status(400).send({error:'Ticket no existe'});
                throw new Error('Ticket no existe');
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
                res.status(400).send({errores:errores});
                throw new Error('Errores en validación');
            }
            const estadoCreado = await this.estadoService.create(estado);
            const ticketAc = await this.ticketService.updateEstado(ticket["_id"],estado.e_nombre);
            ticketAc.t_estado = estado.e_nombre;
            res.send({estado:estadoCreado,ticket:ticketAc});
        } catch (error) {
            console.error(error);
        } 
    }

    @Patch('update/:idEstado')
    async actualizarEstado(
        @Res() res,
        @Body('comentario') comentario:Comentario,
        @Param('idEstado') id_estado,
    ){
        try {
            const estadoEncontrado = await this.estadoService.findByID(id_estado);
            let estado = estadoEncontrado;
            if(estado==null){
                res.status(400).send({error:'Estado no existe'});
                throw new Error('Ticket no encontrado');
            }
            const estadoDto = new EstadoUpdateDto();
            estadoDto.e_nombre = estado.e_nombre;
            estadoDto.e_detalle = estado.e_detalle;
            estadoDto.e_secuencial = estado.e_secuencial;
            estadoDto.e_comentarios = estado.e_comentarios;
            estadoDto.id_ticket = estado.ticket_id;
            estadoDto.tecnico_id = estado.user_id;

            estado.e_comentarios.push(comentario);

            const errores = await validate(estadoDto);
            if(errores.length>0){
                console.error(errores);
                res.status(400).send({errores:errores});
                throw new Error('Errores en validación');
            }
            const estadoActualizado = await this.estadoService.updateByID(estadoEncontrado['_id'],estado);
            res.send({estado:estadoActualizado, comentario:comentario});            
        } catch (error) {
            
        }
    }

    @Get('all/:idTicket')
    async buscarTodos(
        @Res() res,
        @Param('idTicket') ticket_id,
    ){
        try {
            const estadosEncontrado = await this.estadoService.findByTicketID({ticket_id:ticket_id});
            res.send({estado:estadosEncontrado,ticket:null});
        } catch (error) {
            console.error(error);
        }
    }

    @Get('comentarios/:idEstado')
    async buscarPrueba(
        @Res() res,
        @Param('idEstado') estado_id
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
        }
    }

}