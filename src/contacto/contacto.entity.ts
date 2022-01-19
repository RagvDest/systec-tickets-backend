import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from 'mongoose';
import { Persona } from "src/persona/persona.entity";

export type ContactoDocument = Contacto & Document

@Schema()
export class Contacto{
    @Prop({required:true})
    c_tipo:string;

    @Prop({required:true})
    c_contacto:string;

    @Prop({type:mongoose.Schema.Types.ObjectId,ref:'Persona'})
    persona_id:Persona
}

export const ContactoSchema = SchemaFactory.createForClass(Contacto);