import { BadRequestException, Body, Controller, Get, Patch, Post, Res, ValidationPipe } from '@nestjs/common';
import { Ticket} from './ticket.entity';
import { validate } from 'class-validator';
import { TicketService } from './ticket.service';
import { PedidoService } from 'src/pedido/pedido.service';
import { TicketCreateDto } from './dto/pedido.create.dto';

@Controller('ticket')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly pedidoService: PedidoService) {}


  @Patch('update/:idTicket')
  async actualizarTicket(
    @Res() res,
    @Body('ticket') ticket:Ticket,
    @Body('idTicket') idTicket?
  ){
    try {
      const ticketEncontrado = await this.ticketService.findByID(idTicket); 
      if(ticketEncontrado==null){
        res.status(400).send({error:'No existe ticket'});
                throw new BadRequestException('No existe ticket');
      }
      const tick = new TicketCreateDto();
      tick.t_detalle = ticket.t_detalle;
      tick.t_saldo = ticket.t_saldo;
      tick.pedido_id = ticket.pedido_id

      const errores = await validate(tick);
      if(errores.length>0){
        console.error(errores);
        res.send({errores:errores});
      }
      const ticketActualizado = await this.actualizarTicket(ticketEncontrado['_id'],ticket);
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
      try {
        pedido = this.pedidoService.findByID(id_pedido);
        const ticketDto = new TicketCreateDto();
        ticketDto.t_detalle = ticket.t_detalle;
        ticketDto.t_saldo = ticket.t_saldo;
        ticketDto.pedido_id = ticket.pedido_id;

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

  @Get('all')
  async findAll(
      @Res() res?
  ) {
      
      const tickets = await this.ticketService.find();
      console.log(tickets);
      res.send({results:tickets});
  }

}
