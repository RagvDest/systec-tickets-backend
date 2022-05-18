import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Rol, RolDocument } from './rol.entity';

@Injectable()
export class RolService{
    constructor(@InjectModel(Rol.name) private rolModel:Model<Rol>){}

    async findAll(param?):Promise<Rol[]>{
        return this.rolModel.find(param).exec();
    }
    async findByID(id?):Promise<Rol>{
        return this.rolModel.findById(id).exec();
    }
    async crearRol(rol:Rol):Promise<Rol>{
        const rolCreado = new this.rolModel(rol);
        return rolCreado.save();
    }
    async deleteRol(idRol?){
        return this.rolModel.findByIdAndDelete(idRol);
    }

    async isUserType(session,user_type){
        if(!session.rol){
            return true;
        }
        else{
            console.log("Tamos")
            console.log(user_type);
            console.log(session.rol.r_rol);
            if(user_type.length===0) return false;
            let resultado = !user_type.includes(session.rol.r_rol);
            console.log(resultado);
            return resultado;
        }
      }
}