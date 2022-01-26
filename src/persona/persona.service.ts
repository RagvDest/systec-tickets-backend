import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Persona, PersonaDocument } from './persona.entity';

@Injectable()
export class PersonaService{
    constructor(@InjectModel(Persona.name) private personaModel:Model<Persona>){}

    async crear(persona:Persona):Promise<Persona>{
        const personaCreada = new this.personaModel(persona);
        return personaCreada.save();
    };

    async findAll(param?):Promise<Persona[]>{
        return this.personaModel.find(param).exec();
    };

    async deletePerson(id:string){
        return this.personaModel.findByIdAndDelete(id).exec();
    }

    async findByID(persona_id?):Promise<Persona>{
        return this.personaModel.findById(persona_id).exec();
    }

    async updateByID(persona_id?,query?):Promise<Persona>{
        return this.personaModel.findByIdAndUpdate(persona_id,query,{upsert:false});
    }

}