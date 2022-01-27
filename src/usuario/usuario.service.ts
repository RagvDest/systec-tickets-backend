import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario, UsuarioDocument } from './usuario.entity';
import { UsuarioCreateDto } from './dto/usuario.create.dto';


@Injectable()
export class UsuarioService{
    constructor(@InjectModel(Usuario.name) private usuarioModel:Model<UsuarioDocument>){}

    async create(usuarioCreateDto:UsuarioCreateDto):Promise<Usuario>{
        const usuarioCreado = new this.usuarioModel(usuarioCreateDto);
        return usuarioCreado.save();
    }

    async find(param?):Promise<Usuario[]>{
        return this.usuarioModel.find(param).exec();
    }

    async deleteUser(id:string){
        return this.usuarioModel.findByIdAndDelete(id).exec();
    }

    async findByID(usuario_id?):Promise<Usuario>{
        return this.usuarioModel.findById(usuario_id).exec();
    }

    async updateByID(usuario_id?,query?):Promise<Usuario>{
        return this.usuarioModel.findByIdAndUpdate(usuario_id,query,{upsert:false});
    }

    async findByPersonaID(param?):Promise<Usuario>{
        return this.usuarioModel.findOne(param).exec();

    }
}
