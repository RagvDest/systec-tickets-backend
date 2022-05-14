import { BadRequestException, Body, Controller, ForbiddenException, Get, Logger, Param, Patch, Post, Res, Session, ValidationPipe } from '@nestjs/common';
import { Ticket} from './ticket.entity';
import { validate } from 'class-validator';
import { TicketService } from './ticket.service';
import { PedidoService } from 'src/pedido/pedido.service';
import { TicketUpdateDto } from './dto/ticket.update.dto';
import { UsuarioService } from 'src/usuario/usuario.service';
import { PersonaService } from 'src/persona/persona.service';
import { TicketCreateDto } from './dto/ticket.create.dto';
import { RolService } from 'src/rol/rol.service';
import { NotificacionService } from 'src/notificacion/notificacion.service';

@Controller('ticket')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly pedidoService: PedidoService,
    private readonly usuarioService: UsuarioService,
    private readonly personaService: PersonaService,
    private readonly _rolServices:RolService,
    private readonly notifiService:NotificacionService){}

    private logger:Logger = new Logger('TicketController');

  @Patch('update/:idTicket')
  async actualizarTicket(
    @Res() res,
    @Body('ticket') ticket:Ticket,
    @Session() session,
    @Param('idTicket') idTicket?
  ){
    try {
      if(await this._rolServices.isUserType(session,['Admin','Empleado'])){
        res.status(403).send({
          "statusCode": 403,
          "message": "Forbidden resource",
          "error": "Forbidden"
        });
        return;
      }
      const ticketEncontrado = await this.ticketService.findByID(idTicket); 
      if(ticketEncontrado==null){
        res.status(400).send({error:'No existe ticket'});
                throw new BadRequestException('No existe ticket');
      }

      const tick = new TicketUpdateDto();
      tick.t_detalle = ticket.t_detalle;
      tick.t_total = ticket.t_total;
      tick.t_abono = ticket.t_abono;
      tick.t_tipo_equipo = ticket.t_tipo_equipo;
      tick.id_ticket = ticketEncontrado;

      const errores = await validate(tick);
      if(errores.length>0){
        console.error(errores);
        res.send({errores:errores});
        return ;
      }else{
        let pedido = await this.pedidoService.findByID(ticket.pedido_id);

        const ticketActualizado = await this.ticketService.updateByID(ticketEncontrado['_id'],ticket);

        res.send({ticket:Object.assign(ticketActualizado,ticket)});
      }
    } catch (error) {
      this.logger.error(error);
    }

  }
  @Post('crear')
  async crearTicket(
      @Res() res,
      @Body('ticket') ticket:Ticket,
      @Session() session,
      @Body('id_pedido') id_pedido?
      
  ) {
    let pedido;
    let numTicket = Math.random().toString(36).substring(2, 5)+"-"+
                    Math.random().toString(36).substring(2, 5)+"-"+
                    Math.random().toString(36).substring(2, 5);
      try {
        if(await !this._rolServices.isUserType(session,['Admin','Empleado'])){
          throw new ForbiddenException('Forbidden resource');
        }
        pedido = await this.pedidoService.findByID(id_pedido);

        if(ticket.t_re_abierto){
          let ticketAntiguo = await this.ticketService.findByPedidoID({t_num:ticket.t_detalle});
          if(ticketAntiguo.length<1){
            throw new BadRequestException('Ticket no existe');
          }else{
            if(ticketAntiguo[0].t_estado!="CERRADO"){
              throw new BadRequestException('Ticket ACTIVO');
            }
            ticket.t_detalle="Ticket REABIERTO: "+ticket.t_detalle;
          }
        }

        const ticketDto = new TicketCreateDto();
        ticketDto.t_detalle = ticket.t_detalle;
        ticketDto.t_total = ticket.t_total;
        ticketDto.t_abono = ticket.t_abono;
        ticketDto.t_tipo_equipo = ticket.t_tipo_equipo; 
        ticketDto.id_pedido = pedido;
        
        ticket.pedido_id = pedido;
        ticket.t_num = numTicket.toUpperCase();
        ticket.t_estado = 'Nuevo';

        const errores = await validate(ticketDto);
        if(errores.length>0){
          console.error(errores);
          res.send({errores:errores});
        }else{

          console.log("Ticket creado: "+ticket.t_num+" - Pedido: "+id_pedido);
            const ticketCreado = await this.ticketService.create(ticket);

            let notifi = await this.notifiService.generateNotifi(
              "Pedido",pedido.ped_nro_orden,
              "Nuevo Ticket",pedido.usuario_id._id,ticket.pedido_id);

            res.send({ticketCreado: ticketCreado,notificacion:notifi});
        }
      } catch (error) {
        this.logger.error(error);
        res.status(error.status).send(error.response);
      }
  }
  @Get('all/:idPedido')
  async findAll(
      @Res() res,
      @Session() session,
      @Param('idPedido') idPedido
  ) {
    try {
      if(await !this._rolServices.isUserType(session,['Admin','Empleado','Cliente'])){
        res.status(403).send({
          "statusCode": 403,
          "message": "Forbidden resource",
          "error": "Forbidden"
        });
        return;
      }
      const tickets = await this.ticketService.find({pedido_id:idPedido});
      const pedido = await this.pedidoService.findByID(idPedido);
      const usuario = await this.usuarioService.findByID(pedido.usuario_id);
      const persona = await this.personaService.findByID(usuario.persona_id);
      const completo ={
        tickets:tickets.reverse(),
        p_nombres:persona.p_nombres+" "+persona.p_apellidos
      }
      res.send({results:completo});
    } catch (error) {
      this.logger.error(error);
    }
  }

}
