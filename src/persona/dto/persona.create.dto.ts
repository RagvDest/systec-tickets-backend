import { IsNotEmpty, IsString } from "class-validator";

export class PersonaCreateDto{
    @IsNotEmpty()
    @IsString()
    p_nombres:string;

    @IsNotEmpty()
    @IsString()
    p_apellidos:string;

    @IsNotEmpty()
    @IsString()
    p_cedula:string;
}