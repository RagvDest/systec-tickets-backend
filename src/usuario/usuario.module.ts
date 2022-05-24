import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
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
        ]),
        AuthModule
    ],
    controllers:[UsuarioController],
    providers:[UsuarioService, PersonaService, RolService, PedidoService, AuthService, JwtService]
})
export class UsuarioModule {}