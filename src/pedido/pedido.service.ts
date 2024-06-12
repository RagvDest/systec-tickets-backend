import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pedido } from './pedido.entity';
import { Usuario } from 'src/usuario/usuario.entity';
import { Ticket } from 'src/ticket/ticket.entity';
import { Estado } from 'src/estado/estado.entity';
import { throws } from 'assert';

@Injectable()
export class PedidoService{
    constructor(
        @InjectModel(Pedido.name) private pedidoModel:Model<Pedido>,
        @InjectModel(Usuario.name) private usuarioModel:Model<Usuario>
        ){}

    async find(param?,orden?,pathPop?):Promise<Pedido[]>{
        return this.pedidoModel.find(param).populate(pathPop).sort(orden).exec();
    }
    async findByID(id?):Promise<Pedido>{
        return this.pedidoModel.findById(id).exec();
    }
    async create(newPedido:Pedido):Promise<Pedido>{
        const pedidoCreado = new this.pedidoModel(newPedido);
        return pedidoCreado.save();
    }
    async updateByID(pedido_id?,query?):Promise<Pedido>{
        return this.pedidoModel.findByIdAndUpdate(pedido_id,query,{upsert:false});
    }
    async findByParam(param?):Promise<Pedido>{
        return this.pedidoModel.findOne(param).exec();
    }
    async findByIdComplete(idPedido,paramPolulate?):Promise<Pedido>{
        return this.pedidoModel.findById(idPedido).populate(paramPolulate).exec();
    }
    async findByDate(param):Promise<Pedido[]>{
        let pedidos = await this.pedidoModel.aggregate(param).exec();
        await this.usuarioModel.populate(pedidos,{path:'usuario_id',populate:{path:'persona_id'}});
        return pedidos;
    }
    async deleteById(idpedido):Promise<Pedido>{
        return await this.pedidoModel.findByIdAndDelete(idpedido).exec();    }
    async countByEstado(param):Promise<number>{
        return this.pedidoModel.find(param).count().exec();
    }
}