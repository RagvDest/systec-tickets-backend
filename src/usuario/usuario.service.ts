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

    async findAll():Promise<Usuario[]>{
        return this.usuarioModel.find().exec();
    }
}
