import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Estado, EstadoSchema } from 'src/estado/estado.entity';
import { EstadoService } from 'src/estado/estado.service';
import { Notificacion, NotificacionSchema } from 'src/notificacion/notificacion.entity';
import { NotificacionService } from 'src/notificacion/notificacion.service';
import { Pedido, PedidoSchema } from 'src/pedido/pedido.entity';
import { PedidoService } from 'src/pedido/pedido.service';
import { Persona, PersonaSchema } from 'src/persona/persona.entity';
import { PersonaService } from 'src/persona/persona.service';
import { Rol, RolSchema } from 'src/rol/rol.entity';
import { RolService } from 'src/rol/rol.service';
import { Usuario, UsuarioSchema } from 'src/usuario/usuario.entity';
import { UsuarioService } from 'src/usuario/usuario.service';
import { TicketController } from './ticket.controller';
import { Ticket, TicketSchema } from './ticket.entity';
import { TicketService } from './ticket.service';

@Module({
    imports: [MongooseModule.forFeature(
        [
            {name:Ticket.name, schema:TicketSchema},
            {name:Pedido.name, schema:PedidoSchema},
            {name:Estado.name, schema:EstadoSchema},
            {name:Usuario.name, schema:UsuarioSchema},
            {name:Persona.name, schema:PersonaSchema},
            {name:Rol.name, schema:RolSchema},
            {name:Notificacion.name,schema:NotificacionSchema}

        ])],
    controllers:[TicketController],
    providers:[
        TicketService, 
        PedidoService, 
        EstadoService, 
        UsuarioService, 
        PersonaService,
        RolService,
        NotificacionService
    ]
})
export class TicketModule {}