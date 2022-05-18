import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from 'mongoose';
import { Usuario } from "src/usuario/usuario.entity";

export type PedidoDocument = Pedido & Document

@Schema()
export class Pedido{
    @Prop({required:true})
    ped_fc_registro:Date;

    @Prop()
    ped_fc_fin:Date;

    @Prop()
    ped_estado:string;

    @Prop()
    ped_nro_orden:string;

    @Prop({type:mongoose.Schema.Types.ObjectId,ref:'Usuario'})
    usuario_id:Usuario
}

export const PedidoSchema = SchemaFactory.createForClass(Pedido);