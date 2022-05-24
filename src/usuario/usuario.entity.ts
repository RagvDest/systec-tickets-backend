import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Rol } from 'src/rol/rol.entity';
import { Persona } from 'src/persona/persona.entity';


export type UsuarioDocument = Usuario & Document

@Schema()
export class Usuario{

    @Prop({required:true, unique:true})
    u_usuario:string;

    @Prop({required:true, unique:true})
    u_mail:string;

    @Prop()
    u_password:string;

    @Prop({required:true})
    u_activo:boolean;

    @Prop()
    u_hash:string;

    @Prop()
    u_fc_registro:Date;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref:'Rol'})
    rol_id:Rol

    @Prop({type:mongoose.Schema.Types.ObjectId, ref:'Persona'})
    persona_id:Persona

}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);