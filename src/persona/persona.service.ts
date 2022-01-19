import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Persona, PersonaDocument } from './persona.entity';
import { PersonaCreateDto } from './dto/persona.create.dto';

@Injectable()
export class PersonaService{
    constructor(@InjectModel(Persona.name) private personaModel:Model<PersonaDocument>){}

    async create(personaCreateDto:PersonaCreateDto):Promise<Persona>{
        const personaCreada = new this.personaModel(PersonaCreateDto);
        return personaCreada.save();
    };

    async findAll():Promise<Persona[]>{
        return this.personaModel.find().exec();
    };

    async findByID(persona_id?):Promise<Persona>{
        return this.personaModel.findById(persona_id).exec();
    }

}