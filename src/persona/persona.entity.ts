import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { stringify } from "querystring";
import { Tracing } from "trace_events";

export type PersonaDocument = Persona & Document

@Schema()
export class Persona{
    @Prop({required:true})
    p_nombres:string;

    @Prop({required:true})
    p_apellidos:string;

    @Prop({required:true})
    p_cedula:string;

}

export const PersonaSchema = SchemaFactory.createForClass(Persona);