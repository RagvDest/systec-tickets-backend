import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Rol, RolDocument } from './rol.entity';

@Injectable()
export class RolService{
    constructor(@InjectModel(Rol.name) private rolModel:Model<Rol>){}

    async findAll(param?):Promise<Rol[]>{
        return this.rolModel.find(param).exec();
    }
    async findByID(id?):Promise<Rol>{
        return this.rolModel.findById(id).exec();
    }

    async crearRol(rol:Rol):Promise<Rol>{
        const rolCreado = new this.rolModel(rol);
        return rolCreado.save();
    }
}