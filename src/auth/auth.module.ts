import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Usuario, UsuarioSchema } from 'src/usuario/usuario.entity';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { UsuarioService } from 'src/usuario/usuario.service';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategy/local.strategy';
import * as dotenv from 'dotenv';
import { jwtConstants } from './constants';
import { JwtStrategy } from './strategy/jwt.stategy';
import { LocalCliStrategy } from './strategy/localCli.strategy';
import { Pedido, PedidoSchema } from 'src/pedido/pedido.entity';
import { PedidoService } from 'src/pedido/pedido.service';
import { Persona, PersonaSchema } from 'src/persona/persona.entity';
import { PersonaService } from 'src/persona/persona.service';
dotenv.config();

@Module({
  imports: [
    MongooseModule.forFeature([
      {name:Usuario.name, schema:UsuarioSchema},
      {name:Pedido.name, schema:PedidoSchema},
      {name:Persona.name, schema:PersonaSchema}
    ]),
    PassportModule,
    JwtModule.register({})
  ],
  providers: [
    AuthService, 
    LocalStrategy,
    LocalCliStrategy,
    UsuarioService,
    PersonaService,
    PedidoService,
    JwtStrategy
  ]
})
export class AuthModule {}
