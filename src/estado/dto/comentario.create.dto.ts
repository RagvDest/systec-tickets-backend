import { IsNumber, IsNotEmpty, IsString, IsEmpty, IsEmail} from "class-validator";

export class ComentarioCreateDto{
    @IsNotEmpty()
    @IsString()
    c_detalle:string;

    @IsString()
    @IsNotEmpty()
    c_usuario:string;

    @IsString()
    user_id:string;

}