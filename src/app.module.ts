import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PersonaModule } from './persona/persona.module';
import { ContactoModule } from './contacto/contacto.module';
import { RolModule } from './rol/rol.module';
import { UsuarioModule } from './usuario/usuario.module';
import { PedidoModule } from './pedido/pedido.module';
import { TicketService } from './ticket/ticket.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/systec'),
    ContactoModule,
    RolModule,
    PersonaModule,
    UsuarioModule,
    PedidoModule,
    TicketService
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
