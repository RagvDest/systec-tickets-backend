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
        return this.ticketModel.findById(id).exec();
    }
    async create(newTicket:Ticket):Promise<Ticket>{
        const ticketCreado = new this.ticketModel(newTicket);
        return ticketCreado.save();
    }
    async updateByID(ticket_id?,query?):Promise<Ticket>{
        return this.ticketModel.findByIdAndUpdate(ticket_id,query,{upsert:false});
    }

    async findByPedidoID(param?):Promise<Ticket>{
        return this.ticketModel.findOne(param).exec();

    }
}