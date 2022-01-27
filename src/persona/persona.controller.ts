import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Res, ValidationPipe} from '@nestjs/common';
import { PersonaCreateDto } from './dto/persona.create.dto';
import { Persona } from './persona.entity';
import { PersonaService } from './persona.service';
import { validate } from 'class-validator';
import { resolveMx, resolveNaptr } from 'dns';
import { PersonaUpdateDto } from './dto/persona.update.dto';
import { throws } from 'assert';

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

    @Get(':idPersona')
    async buscarPersonaID(
        @Res() res,
        @Param('idPersona') idPersona:string
    ){
        const personaEncontrada = await this._personaServices.findByID(idPersona);
        res.send({personaEncontrada:personaEncontrada});
    }

    @Delete('del/:idPersona')
    async eliminarPersonaID(
        @Res() res,
        @Param('idPersona') idPersona:string
    ){
        const eliminado = await this._personaServices.deletePerson(idPersona);
        res.send({eliminado})
    }

    @Patch('update/:idPersona')
    async actualizarPersonaID(
        @Res() res,
        @Body() persona:Persona,
        @Param('idPersona') idPersona?
    ){
        delete persona['p_cedula'];

        const person = new PersonaUpdateDto();
        person.p_nombres = persona.p_nombres;
        person.p_apellidos = persona.p_apellidos;
        
        try {
            const errores = await validate(person);
            if(errores.length>0){
                console.error(errores);
                res.status(400).send({errores});
            }else{
                const personaEncontrada = await this._personaServices.findByID(idPersona);
                if(personaEncontrada==null){
                    console.error('No existe persona');
                    res.status(400).send({error:'No existe persona'});
                    throw new BadRequestException('No existe persona');
                }
                const personaActualizada = await this._personaServices.updateByID(idPersona,persona);
                res.status(200).send({personaActualizada});
            }
        } catch (error) {
            
        }

    }

    @Post('crear')
    async crearPersona(
        @Res() res,
        @Body() persona:Persona
    ){
        const person = new PersonaCreateDto();
        person.p_nombres = persona.p_nombres;
        person.p_apellidos = persona.p_apellidos;
        person.p_cedula = persona.p_cedula;
        try {
            const errores = await validate(person);

            if(errores.length>0){
                console.error(errores);
                res.send({errores:errores});
            }else{
                const personaCreada = await this._personaServices.crear(persona);
                res.send({personaCreada:personaCreada})
            }
        } catch (error) {
            console.error(error);
        }
    }

}
