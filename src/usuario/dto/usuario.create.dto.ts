import { IsNotEmpty, IsString, IsEmpty, IsEmail} from "class-validator";
import { Persona } from "src/persona/persona.entity";
import { Rol } from "src/rol/rol.entity";


export class UsuarioCreateDto{
    
    @IsNotEmpty()
    @IsString()
    u_usuario:string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    u_mail:string;

    @IsEmpty()
    u_password:string;

    @IsNotEmpty()
    rol_id:Rol;

    @IsNotEmpty()
    persona_id:Persona;

}