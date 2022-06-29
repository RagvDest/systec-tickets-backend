import { Controller, Delete, Get, Logger, Req, Res} from "@nestjs/common";
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
            let results = [], param = {}, actu;
            if(req.user.data.rol_id.r_rol==="Empleado"){
                param = {$or:[{usuario_id:req.user.userId},{usuario_id:null}]};
                results = await this.notiService.find(param);
                actu = await this.notiService.updateAll(param,{"$set":{"n_new":false}});
            }else if(req.user.data.rol_id.r_rol==="Administrador"){
                results = await this.notiService.find();
            }
            else{
                param = {usuario_id:req.user.userId};
                results = await this.notiService.find(param)
                actu = await this.notiService.updateAll(param,{"$set":{"n_new":false}});
            }
            console.log(actu);
            res.send(results);
        } catch (error) {
            this.logger.error(error);
            res.status(500).send(error);
        }
    }

    @Delete('deleteAll')
    async eliminarTodoTest(
        @Req() req,
        @Res() res
    ){
        try {
            let result;
            if(['Admin','Empleado'].includes(req.user.data.rol_id.r_rol)){
                result = await this.notiService.deleteAll();
                res.send(result);
            }else{
                res.status(401).send();
            }
        } catch (error) {
            res.status(500).send('Eror al eliminar notificaciones');
        }
    }

}