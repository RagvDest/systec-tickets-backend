import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pedido, PedidoSchema } from 'src/pedido/pedido.entity';
import { PedidoService } from 'src/pedido/pedido.service';
import { Persona, PersonaSchema } from 'src/persona/persona.entity';
import { PersonaModule } from 'src/persona/persona.module';
import { PersonaService } from 'src/persona/persona.service';
import { RolController } from 'src/rol/rol.controller';
import { Rol, RolSchema } from 'src/rol/rol.entity';
import { RolModule } from 'src/rol/rol.module';
import { RolService } from 'src/rol/rol.service';
import { UsuarioController } from './usuario.controller';
import { Usuario, UsuarioSchema } from './usuario.entity';
import { UsuarioService } from './usuario.service';

@Module({
    imports: [MongooseModule.forFeature(
        [
            {name:Usuario.name, schema:UsuarioSchema},
            {name:Persona.name, schema:PersonaSchema},
            {name:Rol.name, schema:RolSchema},
            {name:Pedido.name,schema:PedidoSchema}
        ])],
                controllers:[UsuarioController],
    providers:[UsuarioService, PersonaService, RolService, PedidoService]
})
export class UsuarioModule {}