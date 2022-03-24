import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from 'src/ticket/ticket.entity';
import { TicketService } from 'src/ticket/ticket.service';
import { EstadoController } from './estado.controller';
import { Estado, EstadoSchema } from './estado.entity';
import { EstadoService } from './estado.service';

@Module({
    imports: [MongooseModule.forFeature([
        {name:Estado.name, schema:EstadoSchema},
        {name:Ticket.name, schema:TicketSchema},
    ])],
    controllers:[EstadoController],
    providers:[EstadoService, TicketService],
    exports:[EstadoService]
})
export class EstadoModule {}