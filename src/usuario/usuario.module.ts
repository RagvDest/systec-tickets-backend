import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuarioController } from './usuario.controller';
import { Usuario, UsuarioSchema } from './usuario.entity';
import { UsuarioService } from './usuario.service';

@Module({
    imports: [MongooseModule.forFeature([{name:Usuario.name, schema:UsuarioSchema}])],
    controllers:[UsuarioController],
    providers:[UsuarioService]
})
export class UsuarioModule {}