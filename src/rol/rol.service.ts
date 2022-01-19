import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Rol, RolDocument } from './rol.entity';

@Injectable()
export class RolService{
    constructor(@InjectModel(Rol.name) private rolModel:Model<Rol>){}

    async findAll():Promise<Rol[]>{
        return this.rolModel.find().exec();
    }
    async findByID(id?):Promise<Rol>{
        return this.rolModel.findById(id).exec();
    }
}