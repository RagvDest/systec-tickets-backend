import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Notificacion, NotificacionDocument } from './notificacion/notificacion.entity';
import { NotificacionService } from './notificacion/notificacion.service';
import { Pedido, PedidoDocument } from './pedido/pedido.entity';

@Injectable()
export class TasksService {
    constructor(
        @InjectModel(Notificacion.name) private notifiModel:Model<NotificacionDocument>,
        @InjectModel(Pedido.name) private pedidoModel:Model<PedidoDocument>,
        private readonly notiService: NotificacionService){}
  private readonly logger = new Logger('Schedule Tasks');

  @Cron('45 * * * * *')
  handleCron() {
    this.logger.debug('Called when the current second is 45');
  }

  
//  @Cron('15 * * * * *') 
  @Cron(CronExpression.EVERY_DAY_AT_11AM)
  async generateRecordatorio(){
    let pedidosActivos = await this.pedidoModel.find({ped_estado:{$not:/CERRADO/},ped_fc_fin:{$ne:null}});
    let date = new Date();
    let pedRecordatorio = pedidosActivos.filter((it)=>{
        
        let diaAntes = new Date(it.ped_fc_fin);
        diaAntes.setDate(diaAntes.getDate()-2);

        if(diaAntes<=date)
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

}