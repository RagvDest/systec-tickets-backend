import { IsNumber, IsNotEmpty, IsString, IsEmpty, IsEmail} from "class-validator";
import { Pedido } from "src/pedido/pedido.entity";
import { Usuario } from "src/usuario/usuario.entity";


export class TicketCreateDto{
    @IsNotEmpty()
    @IsString()
    t_detalle:string;

    @IsString()
    t_tipo_equipo:string;

    @IsNumber()
    t_saldo:number;

    @IsNumber()
    t_abono:number;
}