import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from 'mongoose';
import { Ticket } from "src/ticket/ticket.entity";
import { Usuario } from "src/usuario/usuario.entity";
import { Comentario } from "./comentario.entity";

export type EstadoDocument = Estado & Document

@Schema()
export class Estado{
    @Prop({required:true})
    e_nombre:string;

    @Prop({required:true})
    e_secuencial:number;

    @Prop({required:true})
    e_detalle:string;

    @Prop({})
    e_comentarios:Comentario[]

    @Prop({})
    e_usuario:string;

    @Prop({type:mongoose.Schema.Types.ObjectId,ref:'Ticket'})
    ticket_id:Ticket

    @Prop({type:mongoose.Schema.Types.ObjectId,ref:'Usuario'})
    user_id:Usuario
}

export const EstadoSchema = SchemaFactory.createForClass(Estado);