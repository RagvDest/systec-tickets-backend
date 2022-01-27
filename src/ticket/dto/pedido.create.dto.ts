import { IsNumber, IsNotEmpty, IsString, IsEmpty, IsEmail} from "class-validator";
import { Pedido } from "src/pedido/pedido.entity";


export class TicketCreateDto{
    @IsNotEmpty()
    @IsString()
    t_detalle:string;

    @IsNumber()
    t_saldo:number;

    @IsNotEmpty()
    pedido_id:Pedido;
}