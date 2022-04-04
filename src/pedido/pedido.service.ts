import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pedido } from './pedido.entity';

@Injectable()
export class PedidoService{
    constructor(@InjectModel(Pedido.name) private pedidoModel:Model<Pedido>){}

    async find(param?,orden?):Promise<Pedido[]>{
        return this.pedidoModel.find(param).sort({ped_fc_registro:orden}).exec();
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
}