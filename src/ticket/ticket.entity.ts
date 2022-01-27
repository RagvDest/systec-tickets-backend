import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from 'mongoose';
import { Pedido } from "src/pedido/pedido.entity";

export type TicketDocument = Ticket & Document

@Schema()
export class Ticket{
    @Prop({required:true})
    t_detalle:string;

    @Prop({required:true})
    t_saldo:number;

    @Prop({required:true})
    t_abono:number;

    @Prop({type:mongoose.Schema.Types.ObjectId,ref:'Pedido'})
    pedido_id:Pedido
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);