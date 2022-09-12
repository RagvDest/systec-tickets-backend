import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Estado } from './estado.entity';

@Injectable()
export class EstadoService{
    constructor(@InjectModel(Estado.name) private estadoModel:Model<Estado>){}

    async findAll(param?):Promise<Estado[]>{
        return this.estadoModel.find(param).exec();
    }
    async findByID(id?):Promise<Estado>{
        return this.estadoModel.findById(id).populate({path:'ticket_id'}).exec();
    }
    async findLast(param?):Promise<Estado>{
        return this.estadoModel.findOne(param).sort({e_secuencial:-1}).exec();
    }

    async create(estado?):Promise<Estado>{
        const estadoCreado = new this.estadoModel(estado);
        return estadoCreado.save();
    }
    async deleteEstado(id:string){
        return this.estadoModel.findByIdAndDelete(id).exec();
    }

    async deleteByTicket(id:string){
        return this.estadoModel.deleteMany({ticket_id:id}).exec();
    }

    async updateByID(estado_id?,query?):Promise<Estado>{
        return this.estadoModel.findByIdAndUpdate(estado_id,query,{upsert:false});
    }
    async findByTicketID(param?):Promise<Estado[]>{
        return this.estadoModel.find(param).sort({e_secuencial:-1}).exec();
    }    

}