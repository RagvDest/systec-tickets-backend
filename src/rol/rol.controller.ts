import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Rol } from './rol.entity';
import { RolService } from './rol.service';

@Controller('rol')
export class RolController {
  constructor(private readonly rolService: RolService) {}

  @Post('crear')
  async crearRol(
      @Body() rol:Rol,
      @Res() res?
  ) {
      const rolCreado = await this.rolService.crearRol(rol);
      console.log(rolCreado);
    return rolCreado;
  }

  @Get('all')
  async findAll(
      @Res() res?
  ) {
      const rols = await this.rolService.findAll();
      console.log(rols);
      res.send({results:rols});
  }

}
