import { IsNotEmpty, IsString, IsEmpty, IsEmail} from "class-validator";

export class UsuarioUpdateDto{
    @IsNotEmpty()
    @IsString()
    u_usuario:string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    u_mail:string;

}