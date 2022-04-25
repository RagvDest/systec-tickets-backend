import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Notificacion } from "./notificacion.entity";

@Injectable()
export class NotificacionService{
    constructor(@InjectModel(Notificacion.name) private notificacionModel:Model<Notificacion>){}

    async find(param?):Promise<Notificacion[]>{
        return this.notificacionModel.find(param).sort({n_fc_creado:'desc'}).exec();
    }
    async create(notificacion:Notificacion):Promise<Notificacion>{
        let noti = new this.notificacionModel(notificacion);
        return noti.save();
    }

    async generateNotifi(docu,cod,tipo,userId){
        let notifi = new Notificacion();
            notifi.n_documento = docu;
            notifi.n_codigo = cod;
            notifi.n_fc_creado = new Date();
            notifi.n_new = true;
            notifi.n_tipo = tipo;
            notifi.usuario_id = userId;

            let notifiCreada = await this.create(notifi);
    }
}