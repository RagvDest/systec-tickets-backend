import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Estado } from './estado.entity';

@Injectable()
export class EstadoService{
    constructor(@InjectModel(Estado.name) private estadoModel:Model<Estado>){}

    async findAll():Promise<Estado[]>{
        return this.estadoModel.find().exec();
    }
    async findByID(id?):Promise<Estado>{
        return this.estadoModel.findById(id).exec();
    }

    async create(estado?):Promise<Estado>{
        const estadoCreado = new this.estadoModel(estado);
        return estadoCreado.save();
    }
    async deleteEstado(id:string){
        return this.estadoModel.findByIdAndDelete(id).exec();
    }
}