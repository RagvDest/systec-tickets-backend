import { IsDate, IsNotEmpty, IsString, IsEmpty, IsEmail} from "class-validator";
import { Usuario } from "src/usuario/usuario.entity";


export class PedidoCreateDto{
    @IsNotEmpty()
    @IsDate()
    ped_fc_registro:Date

    @IsNotEmpty()
    usuario_id:Usuario
}