import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Res, ValidationPipe } from '@nestjs/common';
import { Ticket} from './ticket.entity';
import { validate } from 'class-validator';
import { TicketService } from './ticket.service';
import { PedidoService } from 'src/pedido/pedido.service';
import { TicketCreateDto } from './dto/ticket.create.dto';
import { UsuarioService } from 'src/usuario/usuario.service';
import { PersonaService } from 'src/persona/persona.service';

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
    console.log(idTicket);
    try {
      const ticketEncontrado = await this.ticketService.findByID(idTicket); 
      if(ticketEncontrado==null){
        res.status(400).send({error:'No existe ticket'});
                throw new BadRequestException('No existe ticket');
      }
      const tick = new TicketCreateDto();
      tick.t_detalle = ticket.t_detalle;
      tick.t_saldo = ticket.t_saldo;
      tick.t_abono = ticket.t_abono;
      tick.t_tipo_equipo = ticket.t_tipo_equipo;

      const errores = await validate(tick);
      if(errores.length>0){
        console.error(errores);
        res.send({errores:errores});
      }
      const ticketActualizado = await this.ticketService.updateByID(ticketEncontrado['_id'],ticket);
      res.send({ticket:ticketActualizado});
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
        ticketDto.t_saldo = ticket.t_saldo;
        ticketDto.t_abono = ticket.t_abono;
        ticketDto.t_tipo_equipo = ticket.t_tipo_equipo; 
        
        ticket.pedido_id = pedido;
        ticket.t_num = numTicket.toUpperCase();

        const errores = await validate(ticketDto);
        if(errores.length>0){
          console.error(errores);
          res.send({errores:errores});
        }else{
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
