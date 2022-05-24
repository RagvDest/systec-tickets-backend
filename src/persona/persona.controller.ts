import { BadRequestException, Body, Controller, Delete, Get, Logger, NotFoundException, Param, Patch, Post, Req, Res} from '@nestjs/common';
import { PersonaCreateDto } from './dto/persona.create.dto';
import { Persona } from './persona.entity';
import { PersonaService } from './persona.service';
import { validate } from 'class-validator';
import { resolveMx, resolveNaptr } from 'dns';
import { PersonaUpdateDto } from './dto/persona.update.dto';
import { throws } from 'assert';
import { RolService } from 'src/rol/rol.service';

@Controller('persona')
export class PersonaController{
    constructor(
        private readonly _personaServices:PersonaService,
        private readonly _rolServices:RolService){}

    private logger:Logger = new Logger('PersonaController');

    @Get('all')
    async buscarPersonas(
        @Res() res,
        @Req() req
    ){
        try {
            if(req.user.data.rol_id.r_rol==='Cliente'){
                res.status(401).send();
                return;
            } 

            const personas = await this._personaServices.findAll();
            res.send({results:personas});
            return personas;
        } catch (error) {
            this.logger.error(`Personas ALL: ${error}`);
            res.status(500).send(error);
        }
    }

    @Get(':idPersona')
    async buscarPersonaID(
        @Res() res,
        @Param('idPersona') idPersona:string,
        @Req() req
    ){
        try {
            
            const personaEncontrada = await this._personaServices.findByID(idPersona);
            res.send({personaEncontrada:personaEncontrada});
        } catch (error) {
            this.logger.error(`Persona ID: ${error}`);
            res.status(500).send(error);
        }
    }

    @Delete('del/:idPersona')
    async eliminarPersonaID(
        @Res() res,
        @Param('idPersona') idPersona:string,
        @Req() req
    ){
        try {
            if(req.user.data.rol_id.r_rol==='Cliente'){
                res.status(401).send();
                return;
            } 
            const eliminado = await this._personaServices.deletePerson(idPersona);
            this.logger.log(`Persona ${idPersona} eliminada.`)
            this.logger.log(`Usuario resposable: ${req.user.data.u_usuario} - ${req.user.data.rol_id.r_rol}`);
            res.send({eliminado})
        } catch (error) {
            this.logger.error(`Del Persona: ${error}`);
            res.status(500).send(error);
        }
    }

    @Patch('update/:idPersona')
    async actualizarPersonaID(
        @Res() res,
        @Body() persona:Persona,
        @Req() req,
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
            this.logger.error(`Update Persona: ${error}`);
            res.status(500).send(error);
        }

    }

    @Post('crear')
    async crearPersona(
        @Res() res,
        @Body() persona:Persona,
        @Req() req
    ){
        const person = new PersonaCreateDto();
        person.p_nombres = persona.p_nombres;
        person.p_apellidos = persona.p_apellidos;
        person.p_cedula = persona.p_cedula;
        try {
            if(req.user.data.rol_id.r_rol==='Cliente'){
                res.status(401).send();
                return;
            } 
            const errores = await validate(person);

            if(errores.length>0){
                console.error(errores);
                res.send({errores:errores});
            }else{
                const personaCreada = await this._personaServices.crear(persona);
                res.send({personaCreada:personaCreada})
            }
        } catch (error) {
            this.logger.error(`Crear Persona: ${error}`);
            res.status(500).send(error);
        }
    }

}
