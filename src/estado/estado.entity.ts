import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from 'mongoose';

export type EstadoDocument = Estado & Document

@Schema()
export class Estado{
    @Prop({required:true})
    e_nombre:string;
}

export const EstadoSchema = SchemaFactory.createForClass(Estado);