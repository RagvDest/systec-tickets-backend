import { Controller, Get, Logger, Req, Res} from "@nestjs/common";
import { AppGateway } from "src/app.gateway";
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
        @Req() req,
        @Res() res
    ){
        try {
            let results = [];
            if(['Admin','Empleado'].includes(req.user.data.rol_id.r_rol)){
                results = await this.notiService.find({usuario_id:req.user.userId})
            }else{
                results = await this.notiService.find({$or:[{usuario_id:req.user.userId},{usuario_id:null}]});
            }
            res.send(results);
        } catch (error) {
            this.logger.error(error);
            res.status(500).send(error);
        }
    }

}