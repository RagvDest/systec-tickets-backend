import { IsEmpty, IsString } from "class-validator";

export class PersonaUpdateDto{

    @IsString()
    p_nombres:string;
    
    @IsString()
    p_apellidos:string;
}