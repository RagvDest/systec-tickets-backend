import { Body, Controller, Get, Post, Res} from '@nestjs/common';
import { PersonaCreateDto } from './dto/persona.create.dto';
import { Persona } from './persona.entity';
import { PersonaService } from './persona.service';

@Controller('persona')
export class PersonaController{
    constructor(private readonly _personaServices:PersonaService){}

    @Get('all')
    async buscarPersonas(
        @Res() res
    ){
        const personas = await this._personaServices.findAll();
        res.send({results:personas});
        return personas;
    }

    @Post('crear')
    async crearPersona(
        @Res() res,
        @Body() persona:PersonaCreateDto
    ){
        
    }

}
