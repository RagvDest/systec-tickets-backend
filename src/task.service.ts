import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Notificacion, NotificacionDocument } from './notificacion/notificacion.entity';
import { NotificacionService } from './notificacion/notificacion.service';
import { Pedido, PedidoDocument } from './pedido/pedido.entity';
import { AppService } from './app.service';

@Injectable()
export class TasksService {
    constructor(
        @InjectModel(Notificacion.name) private notifiModel:Model<NotificacionDocument>,
        @InjectModel(Pedido.name) private pedidoModel:Model<PedidoDocument>,
        private readonly notiService: NotificacionService,
        private readonly appService: AppService){}
  private readonly logger = new Logger('Schedule Tasks');


  
//  @Cron('15 * * * * *') 
  @Cron(CronExpression.EVERY_DAY_AT_11AM)
  async generateRecordatorio(){
    let pedidosActivos = await this.pedidoModel.find({ped_estado:{$not:/CERRADO/},ped_fc_fin:{$ne:null}});
    let date = new Date();
    let pedRecordatorio = pedidosActivos.filter((it)=>{
        
        let diaAntes = new Date(it.ped_fc_fin);
        diaAntes.setDate(diaAntes.getDate()-1);
        let diff = (date.getTime() - diaAntes.getTime())*(1000*60*60*24);
        diff = this.appService.round10('round',diff,0);

        if(diff<=1)
            return true;
        else return false;
    });
    let notificacion;
    for(let i=0;i<pedRecordatorio.length;i++){
        let pedSelect = pedRecordatorio[i];
        notificacion = await this.notiService.generateNotifi(
            'Pedido',pedRecordatorio[i].ped_nro_orden,
            'Recordatorio',null,pedSelect['_id']
        );
    };
  }

  //@Cron('15 * * * * *') 
  @Cron(CronExpression.EVERY_12_HOURS)
  async customNotifi(){
    this.logger.debug("Evento Crono");
    let pedidosActivos = await this.pedidoModel.find(
      {
        ped_estado:{$not:/CERRADO/},
        ped_fc_noti:{$ne:null}
      });
      console.log(pedidosActivos.length);
      let date = new Date();
      let pedRecordatorio = pedidosActivos.filter((it)=>{
        console.log(it.ped_fc_noti);
        let diaAntes = new Date(it.ped_fc_noti);
        diaAntes.setDate(diaAntes.getDate()-1);
        this.logger.debug(diaAntes.getTime());
        this.logger.debug(date.getTime());
        let diff = (date.getTime() - diaAntes.getTime())/(1000*60*60*24);
        console.log(diff);
        diff = this.appService.round10('round',diff,0);
        console.log(diff);

        if(diff<=1)
            return true;
        else return false;
    });
    console.log(pedRecordatorio);
    let notificacion;
    for(let i=0;i<pedRecordatorio.length;i++){
        let pedSelect = pedRecordatorio[i];
        notificacion = await this.notiService.generateNotifi(
            'Pedido',pedRecordatorio[i].ped_nro_orden,
            'Recordatorio',null,pedSelect['_id']
        );
    };
  }

}