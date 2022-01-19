import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type RolDocument = Rol & Document

@Schema()
export class Rol{
    @Prop({required:true})
    r_rol:string;
}

export const RolSchema = SchemaFactory.createForClass(Rol);