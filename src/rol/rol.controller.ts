import { Body, Controller, Get, Logger, Post, Req, Res } from '@nestjs/common';
import { Rol } from './rol.entity';
import { RolService } from './rol.service';

@Controller('rol')
export class RolController {
  constructor(private readonly rolService: RolService) {}
  
  private logger:Logger = new Logger('RolController');


  @Post('crear')
  async crearRol(
      @Body() rol:Rol,
      @Req() req,
      @Res() res?
  ) {
    if( req.user.data.rol_id.r_rol === 'Cliente' ||
        req.user.data.rol_id.r_rol === 'Empleado'){
      res.status(401).send();
      return;
    } 
      const rolCreado = await this.rolService.crearRol(rol);
    res.send(rolCreado);
  }

  @Get('all')
  async findAll(
    @Req() req,
    @Res() res?
) {
    try {
      if(req.user.data.rol_id.r_rol==='Cliente'){
        res.status(401).send();
        return;
      } 
        
        let param = {
          r_rol : {$ne: 'Administrador'}
        }
        const rols = await this.rolService.findAll(param);
        res.send({results:rols});
    } catch (error) {
      this.logger.error(`Find Rol: ${error}`);
      res.status(500).send(error);
    }
    
  }
}
