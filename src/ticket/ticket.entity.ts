import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from 'mongoose';
import { Estado } from "src/estado/estado.entity";
import { Pedido } from "src/pedido/pedido.entity";
import { Usuario } from "src/usuario/usuario.entity";

export type TicketDocument = Ticket & Document

@Schema()
export class Ticket{
    @Prop({required:true})
    t_detalle:string;

    @Prop({required:true})
    t_total:number;

    @Prop({required:true})
    t_abono:number;

    @Prop({required:true})
    t_num:string;

    @Prop({required:true})
    t_tipo_equipo:string;

    @Prop({required:true})
    t_estado:string;

    @Prop()
    t_re_abierto:boolean;

    @Prop({type:mongoose.Schema.Types.ObjectId,ref:'Estado'})
    estado_id:Estado;

    @Prop({type:mongoose.Schema.Types.ObjectId,ref:'Pedido'})
    pedido_id:Pedido
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);