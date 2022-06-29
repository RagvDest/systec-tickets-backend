import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Notificacion } from "./notificacion.entity";

@Injectable()
export class NotificacionService{
    constructor(@InjectModel(Notificacion.name) private notificacionModel:Model<Notificacion>){}

    async find(param?):Promise<Notificacion[]>{
        return await this.notificacionModel.find(param).populate({path:'usuario_id'}).sort({n_fc_creado:'desc'}).exec();
    }
    async create(notificacion:Notificacion):Promise<Notificacion>{
        let noti = new this.notificacionModel(notificacion);
        return await noti.save();
    }

    async updateAll(filtro,param){
        return await this.notificacionModel.updateMany(filtro,param);
    }

    async deleteAll(){
        return await this.notificacionModel.deleteMany().exec();
    }

    async generateNotifi(docu,cod,tipo,userId,pedido){
        let notifi = new Notificacion();
            notifi.n_documento = docu;
            notifi.n_codigo = cod;
            notifi.n_fc_creado = new Date();
            notifi.n_new = true;
            notifi.n_tipo = tipo;
            notifi.usuario_id = userId;
            notifi.pedido_id=pedido;

            return await this.create(notifi);
    }
}