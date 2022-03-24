import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Res, ValidationPipe } from '@nestjs/common';
import { Ticket} from './ticket.entity';
import { validate } from 'class-validator';
import { TicketService } from './ticket.service';
import { PedidoService } from 'src/pedido/pedido.service';
import { TicketUpdateDto } from './dto/ticket.update.dto';
import { UsuarioService } from 'src/usuario/usuario.service';
import { PersonaService } from 'src/persona/persona.service';
import { TicketCreateDto } from './dto/ticket.create.dto';

@Controller('ticket')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly pedidoService: PedidoService,
    private readonly usuarioService: UsuarioService,
    private readonly personaService: PersonaService) {}


  @Patch('update/:idTicket')
  async actualizarTicket(
    @Res() res,
    @Body('ticket') ticket:Ticket,
    @Param('idTicket') idTicket?
  ){
    console.log(JSON.stringify(idTicket));
    try {
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
      }
      const ticketActualizado = await this.ticketService.updateByID(ticketEncontrado['_id'],ticket);
      res.send({ticket:Object.assign(ticketActualizado,ticket)});
    } catch (error) {
      console.error(error);
    }

  }
  @Post('crear')
  async crearTicket(
      @Res() res,
      @Body('ticket') ticket:Ticket,
      @Body('id_pedido') id_pedido?
      
  ) {
    let pedido;
    let numTicket = Math.random().toString(36).substring(2, 5)+"-"+
                    Math.random().toString(36).substring(2, 5)+"-"+
                    Math.random().toString(36).substring(2, 5);
      try {
        pedido = await this.pedidoService.findByID(id_pedido);
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
            res.send({ticketCreado: ticketCreado});
        }
      } catch (error) {
        console.error(error);
      }
  }
  @Get('all/:idPedido')
  async findAll(
      @Res() res?,
      @Param('idPedido') idPedido?
  ) {
      const tickets = await this.ticketService.find({pedido_id:idPedido});
      const pedido = await this.pedidoService.findByID(idPedido);
      const usuario = await this.usuarioService.findByID(pedido.usuario_id);
      const persona = await this.personaService.findByID(usuario.persona_id);
      const completo ={
        tickets:tickets,
        p_nombres:persona.p_nombres+" "+persona.p_apellidos
      }
      console.log(tickets);
      res.send({results:completo});
  }

}
