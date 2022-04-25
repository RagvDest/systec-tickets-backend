import { Controller, Get, Logger, Res, Session } from "@nestjs/common";
import { RolService } from "src/rol/rol.service";
import { NotificacionService } from "./notificacion.service";

@Controller('noti')
export class NotificacionController {
  constructor(
    private readonly notiService: NotificacionService,
    private readonly _rolServices:RolService){}

    private logger:Logger = new Logger('NotificacionController');

    @Get('all')
    async getAll(
        @Session() session,
        @Res() res
    ){
        try {
            let results = [];
            if(await this._rolServices.isUserType(session,['Admin','Empleado'])){
                results = await this.notiService.find({usuario_id:session.usuario._id})
            }else{
                results = await this.notiService.find({$or:[{usuario_id:session.usuario._id},{usuario_id:null}]});
            }
            res.send(results);
        } catch (error) {
            this.logger.error(error);
        }
    }

}