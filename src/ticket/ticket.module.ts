import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pedido, PedidoSchema } from 'src/pedido/pedido.entity';
import { PedidoService } from 'src/pedido/pedido.service';
import { TicketController } from './ticket.controller';
import { Ticket, TicketSchema } from './ticket.entity';
import { TicketService } from './ticket.service';

@Module({
    imports: [MongooseModule.forFeature(
        [
            {name:Ticket.name, schema:TicketSchema},
            {name:Pedido.name, schema:PedidoSchema}

        ])],
    controllers:[TicketController],
    providers:[TicketService, PedidoService]
})
export class TicketModule {}