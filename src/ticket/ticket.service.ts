import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Ticket } from './ticket.entity';

@Injectable()
export class TicketService{
    constructor(@InjectModel(Ticket.name) private ticketModel:Model<Ticket>){}

    async find(param?):Promise<Ticket[]>{
        return this.ticketModel.find(param).exec();
    }
    async findByID(id?):Promise<Ticket>{
        return this.ticketModel.findById(id).populate('pedido_id').exec();
    }
    async create(newTicket:Ticket):Promise<Ticket>{
        const ticketCreado = new this.ticketModel(newTicket);
        return ticketCreado.save();
    }
    async updateByID(ticket_id?,query?):Promise<Ticket>{
        return this.ticketModel.findByIdAndUpdate(ticket_id,query,{upsert:false});
    }
    async findByPedidoID(param?):Promise<Ticket[]>{
        return this.ticketModel.find(param).exec();
    }
    async updateEstado(ticket_id:string,estado:string):Promise<Ticket>{
        return (await this.ticketModel.findByIdAndUpdate(ticket_id,{t_estado:estado}).populate('pedido_id'));
    }
    async cerrarTicketsByPedidoID(pedido_id){
        let tickets = this.ticketModel.updateMany({pedido_id:pedido_id},{$set:{t_estado:'CERRADO'}});
        return tickets;
    }
    async countTickets(param):Promise<number>{
        return this.ticketModel.countDocuments(param).exec();
    }
    async findAll():Promise<Ticket[]>{
        return this.ticketModel.find().exec();
    }
    async deleteByID(id):Promise<Ticket>{
        return this.ticketModel.findByIdAndDelete(id).exec();
    }
}