import { Controller, Get} from '@nestjs/common';
import { UsuarioService } from './usuario.service';

@Controller('user')
export class UsuarioController{
    constructor(private readonly _usuarioServices:UsuarioService){}

}
