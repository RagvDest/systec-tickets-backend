import { Body, Controller, Get, Logger, Post, Res, Session } from '@nestjs/common';
import { Rol } from './rol.entity';
import { RolService } from './rol.service';

@Controller('rol')
export class RolController {
  constructor(private readonly rolService: RolService) {}
  
  private logger:Logger = new Logger('RolController');


  @Post('crear')
  async crearRol(
      @Body() rol:Rol,
      @Session() session,
      @Res() res?
  ) {
    if(await this.rolService.isUserType(session,'Admin')){
      res.status(403).send({
        "statusCode": 403,
        "message": "Forbidden resource",
        "error": "Forbidden"
      });
      return;
    }
      const rolCreado = await this.rolService.crearRol(rol);
      console.log(rolCreado);
    return rolCreado;
  }

  @Get('all')
  async findAll(
    @Session() session,
    @Res() res?
) {
    try {
        if(await this.rolService.isUserType(session,['Admin','Empleado'])){
          res.status(403).send({
            "statusCode": 403,
            "message": "Forbidden resource",
            "error": "Forbidden"
          });
          return;
        }
        
        let param = {
          r_rol : {$ne: 'Administrador'}
        }
        const rols = await this.rolService.findAll(param);
        res.send({results:rols});
    } catch (error) {
      this.logger.error(error);
    }
    
  }
}
