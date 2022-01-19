import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Contacto } from './contacto.entity';

@Injectable()
export class ContactoService{
    constructor(@InjectModel(Contacto.name) private contactoModel:Model<Contacto>){}

    async findAll():Promise<Contacto[]>{
        return this.contactoModel.find().exec();
    }
    async findByID(id?):Promise<Contacto>{
        return this.contactoModel.findById(id).exec();
    }
}