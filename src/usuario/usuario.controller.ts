import { Body, Controller, Get, Post, Res} from '@nestjs/common';
import { Usuario } from './usuario.entity';
import { UsuarioService } from './usuario.service';

@Controller('users')
export class UsuarioController{
    constructor(private readonly _usuarioServices:UsuarioService){}

    @Get('all')
    async buscarUsuarios(
        @Res() res
    ){
        const usuarios = await this._usuarioServices.findAll();
        res.send({results:usuarios});
        return usuarios;
    }

}
