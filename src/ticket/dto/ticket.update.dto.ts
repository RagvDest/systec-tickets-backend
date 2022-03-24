import { IsNumber, IsNotEmpty, IsString, IsEmpty, IsEmail} from "class-validator";
import { Ticket } from "../ticket.entity";


export class TicketUpdateDto{
    @IsNotEmpty()
    @IsString()
    t_detalle:string;

    @IsString()
    t_tipo_equipo:string;

    @IsNumber()
    t_total:number;

    @IsNumber()
    t_abono:number;

    @IsNotEmpty()
    id_ticket:Ticket

}