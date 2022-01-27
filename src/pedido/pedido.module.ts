import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from 'src/usuario/usuario.entity';
import { UsuarioService } from 'src/usuario/usuario.service';
import { PedidoController } from './pedido.controller';
import { Pedido, PedidoSchema } from './pedido.entity';
import { PedidoService } from './pedido.service';

@Module({
    imports: [MongooseModule.forFeature(
        [
            {name:Pedido.name, schema:PedidoSchema},
            {name:Usuario.name, schema:UsuarioSchema}

        ])],
    controllers:[PedidoController],
    providers:[PedidoService, UsuarioService]
})
export class PedidoModule {}