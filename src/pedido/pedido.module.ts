import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Estado, EstadoSchema } from 'src/estado/estado.entity';
import { EstadoService } from 'src/estado/estado.service';
import { Notificacion, NotificacionSchema } from 'src/notificacion/notificacion.entity';
import { NotificacionService } from 'src/notificacion/notificacion.service';
import { Persona, PersonaSchema } from 'src/persona/persona.entity';
import { PersonaService } from 'src/persona/persona.service';
import { Rol, RolSchema } from 'src/rol/rol.entity';
import { RolService } from 'src/rol/rol.service';
import { Ticket, TicketSchema } from 'src/ticket/ticket.entity';
import { TicketService } from 'src/ticket/ticket.service';
import { Usuario, UsuarioSchema } from 'src/usuario/usuario.entity';
import { UsuarioService } from 'src/usuario/usuario.service';
import { PedidoController } from './pedido.controller';
import { Pedido, PedidoSchema } from './pedido.entity';
import { PedidoService } from './pedido.service';

@Module({
    imports: [MongooseModule.forFeature(
        [
            {name:Pedido.name, schema:PedidoSchema},
            {name:Usuario.name, schema:UsuarioSchema},
            {name:Persona.name, schema:PersonaSchema},
            {name:Rol.name, schema:RolSchema},
            {name:Ticket.name,schema:TicketSchema},
            {name:Estado.name,schema:EstadoSchema},
            {name:Notificacion.name,schema:NotificacionSchema}

        ])],
    controllers:[PedidoController],
    providers:[
        PedidoService, 
        UsuarioService,
        PersonaService,
        RolService,
        TicketService,
        EstadoService,
        NotificacionService
    ]
})
export class PedidoModule {}