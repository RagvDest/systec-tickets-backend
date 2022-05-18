import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from 'mongoose';
import { Pedido } from "src/pedido/pedido.entity";
import { Usuario } from "src/usuario/usuario.entity";

export type NotificacionDocument = Notificacion & Document

@Schema()
export class Notificacion{
    @Prop({required:true})
    n_documento:string

    @Prop({required:true})
    n_codigo:string

    @Prop({required:true})
    n_tipo:string

    @Prop({required:true})
    n_new:boolean

    @Prop({required:true})
    n_fc_creado:Date

    @Prop({type:mongoose.Schema.Types.ObjectId,ref:'Pedido'})
    pedido_id:Pedido

    @Prop({type:mongoose.Schema.Types.ObjectId,ref:'Usuario'})
    usuario_id:Usuario
}

export const NotificacionSchema = SchemaFactory.createForClass(Notificacion);
