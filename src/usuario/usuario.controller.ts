import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, Res, Session} from '@nestjs/common';
import { PersonaCreateDto } from 'src/persona/dto/persona.create.dto';
import { Persona } from 'src/persona/persona.entity';
import { UsuarioCreateDto } from './dto/usuario.create.dto';
import { Usuario } from './usuario.entity';
import { validate } from 'class-validator';
import { UsuarioService } from './usuario.service';
import { PersonaService } from 'src/persona/persona.service';
import { RolService } from 'src/rol/rol.service';
import { UsuarioUpdateDto } from './dto/usuario.update.dto';
import { PersonaUpdateDto } from 'src/persona/dto/persona.update.dto';

const bcrypt = require('bcryptjs');
const saltRounds = 10;

@Controller('users')
export class UsuarioController{
    constructor(
        private readonly _usuarioServices:UsuarioService,
        private readonly _personaServices:PersonaService,
        private readonly _rolServices:RolService
    ){}

    @Get('logout')
    logout(
        @Res() res,
        @Session() session
    ){
      console.log("Hola");
      session.usuario=undefined;
      session.destroy();
      res.status(200).send({mensaje:"Ha cerrado su sesión"});
  }


    @Post('pass')
    async cambiarPassword(
        @Res() res,
        @Body('pass') pass,
        @Body('id_user') idUsuario
    ){
        try {
            const usuario = await this._usuarioServices.findByID(idUsuario);
            if(usuario == null){
                res.status(400).send({error:'No existe usuario'});
                throw new Error("No existe usuario");
            }
            let hash = await bcrypt.hash(pass, saltRounds);
            usuario.u_password = hash;
            const usuarioActualizado = await this._usuarioServices.updateByID(idUsuario,usuario);
            
            res.status(200).send({usuarioActualizado,mensaje:"Contraseña guardada"});
        } catch (error) {
            console.error(error);
        }
    }

    @Post('logIn')
    async logInUserPass(
        @Res() res,
        @Body('password') pass,
        @Body('username') username,
        @Session() session
    ){
        console.log(username);
        console.log(pass);
        try {
            let usuarioArr = await this._usuarioServices.find({u_usuario:username});
            let usuario = usuarioArr[0];
            if(usuario==null){
                res.status(400).send({mensaje:"Error al iniciar sesión. Revise su usuario y contraseña"});
                throw new Error("Error al iniciar sesión. Revise su usuario1 y contraseña");
            }
            const match = await bcrypt.compare(pass,usuario.u_password);
            if(match){
                let usuarioSession = {
                    _id:usuario["_id"],
                    persona_id:usuario.persona_id,
                    u_mail:usuario.u_mail,
                    u_activo:usuario.u_activo,
                    u_usuario:usuario.u_usuario
                };
                session.usuario = usuarioSession;
                let rol = await this._rolServices.findByID(usuario.rol_id);
                session.rol = rol;
                let persona = await this._personaServices.findByID(usuario.persona_id);
                res.send({usuario:session.usuario,rol:session.rol.r_rol, persona:persona});
            }
            else{
                res.status(400).send({mensaje:"Error al iniciar sesión. Revise su usuario y contraseña"});
                throw new Error("Error al iniciar sesión. Revise su usuario y contraseña");
            }
            
            
        } catch (error) {
            console.error(error);
            res.send({error});
        }
    }

    @Get('all')
    async buscarUsuarios(
        @Res() res,
        @Query('filtro') filtro?,
        @Query('input') input?,
        @Query('op') op?
    ){
        let param;
        if(filtro=='Username')
            param = {u_usuario: { $regex: '.*' + input + '.*' }}
        else if (filtro=='Correo')
            param = {u_mail: { $regex: '.*' + input + '.*' }}
        else if(filtro == 'Nombres')
            param = {p_nombres:{ $regex: '.*' + input + '.*' }}
        else if(filtro == 'Cédula')
            param = {p_cedula:{ $regex: '.*' + input + '.*' }}
        try {
            const results = await this.llenarDatos(op,param);    
            res.send({results:results});
        } catch (error) {
            console.error(error);
            res.status(500).send();
        }
        
        
    }

    @Patch('estado/:idUsuario')
    async cambiarEstado(
        @Res() res,
        @Param('idUsuario') idUsuario
    ){
        try {
            const usuarioEncontrado = await this._usuarioServices.findByID(idUsuario);
            if(usuarioEncontrado==null){
                res.status(400).send({error:'Usuario no existe'});
                throw new Error("Usuario no existe");
            }
            usuarioEncontrado.u_activo = !usuarioEncontrado.u_activo;
            const usuarioActualizado = await this._usuarioServices.updateByID(idUsuario,usuarioEncontrado);
            res.status(200).send(usuarioActualizado);

        } catch (error) {
            console.error(error);
        }
    }

    /*@Delete('del/:idUsuario')
    async eliminarUsuarioID(
        @Res() res,
        @Param('idUsuario') idUsuario:string
    ){
        const eliminado = await this._usuarioServices.deleteUser(idUsuario);
        res.send({eliminado})
    }*/

   

    @Post('crear')
    async crearUsuario(
        @Res() res,
        @Body('usuario') usuario:Usuario,
        @Body('persona') persona:Persona,
        @Body('rol') rol:string
    ){
        var id_persona;
        try {
            id_persona = await this.crearPersona(res,persona);
            usuario.persona_id = id_persona;

            const rol_id = await this._rolServices.findByID(rol);
            usuario.rol_id = rol_id;
            
            //Validacion DTO
            const user = new UsuarioCreateDto();
            user.u_mail = usuario.u_mail;
            user.u_usuario = usuario.u_usuario;
            user.rol_id = usuario.rol_id;
            user.persona_id = usuario.persona_id;
        
            const errores = await validate(user);

            if(errores.length>0){
                console.error(errores);
                res.send({errores:errores});
            }else{
                usuario.u_activo = true;
                const usuarioCreado = await this._usuarioServices.create(usuario);
                res.send({ok:true,usuarioCreado:usuarioCreado})
            }
        } catch (error) {
            console.error(error);
            // Eliminar persona
            await this._personaServices.deletePerson(id_persona['_id']);
        }
    }

    @Get(':idUsuario')
    async buscarUsuarioID(
        @Res() res,
        @Param('idUsuario') idUsuario:string
    ){
        try {
            const usuarioEncontrado = await this._usuarioServices.findByID(idUsuario);
            if(usuarioEncontrado==null){
                res.status(400).send({error:'No existe usuario'});
                throw new BadRequestException('No existe usuario');
            }
            const personaEncontrada = await this._personaServices.findByID(usuarioEncontrado.persona_id);
            const rolEncontrado = await this._rolServices.findByID(usuarioEncontrado.rol_id);
            res.send({usuario:usuarioEncontrado, persona:personaEncontrada, rol:rolEncontrado});
        } catch (error) {
            console.error(error);
            res.status(400).send({error:error});
        }
    }

    @Patch('update/:idUsuario')
    async actualizarUsuario(
        @Res() res,
        @Body('usuario') usuario:Usuario,
        @Body('persona') persona:Persona,
        @Param('idUsuario') idUsuario?
    ){
        var idPersona;
        try {
            const usuarioEncontrado = await this._usuarioServices.findByID(idUsuario);
            if(usuarioEncontrado==null){
                res.status(400).send({error:'No existe usuario'});
                throw new BadRequestException('No existe usuario');
            }
            const personaEncontrada = await this._personaServices.findByID(usuarioEncontrado.persona_id);
            idPersona = personaEncontrada['_id'];

            const user = new UsuarioUpdateDto();
            user.u_mail = usuario.u_mail;
            user.u_usuario = usuario.u_usuario
            delete usuario.u_password;

            const person = new PersonaUpdateDto();
            person.p_nombres = persona.p_nombres;
            person.p_apellidos = persona.p_apellidos;

            
            const erroresUser = await validate(user);
            const erroresPerson = await validate(person);

            if(erroresUser.length>0 || erroresPerson.length>0){
                console.error(erroresUser);
                console.error(erroresPerson);
                res.send({errores_usuario:erroresUser, errores_persona:erroresPerson});
            }else{
                console.log(usuarioEncontrado.persona_id)
                const personaActualizada = await this._personaServices.updateByID(idPersona,persona);
                const usuarioActualizado = await this._usuarioServices.updateByID(usuarioEncontrado['_id'],usuario);
                res.send({usuario:usuarioActualizado,persona:personaActualizada});
            }
        } catch (error) {
            console.error(error);
            // Eliminar persona
        }
    }

    // COMPLEMENTOS
    async crearPersona(
        @Res() res,
        persona:Persona
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
                return personaCreada;
            }
        } catch (error) {
            console.error(error);
        }
    }

    async llenarDatos(
        op:string,
        param?
    ){
        const results =[];
        let usuarios, personas, usuario, persona;

        let completo={
            username:{},
            persona:{}
        };

        if(op==='u'){
            usuarios = await this._usuarioServices.find(param);
            for(var i=0;i<usuarios.length;i++){
                completo={
                    username:{},
                    persona:{}
                };
                persona = await this._personaServices.findByID(usuarios[i].persona_id);
                completo.username = usuarios[i];
                completo.persona = persona;
                results.push(completo);
            }
        }else if(op==='p' || param==null){
            personas = await this._personaServices.findAll(param);
            for(var i=0;i<personas.length;i++){
                completo={
                    username:{},
                    persona:{}
                };
                usuario = await this._usuarioServices.findByPersonaID({persona_id:personas[i]._id});
                completo.username = usuario;
                completo.persona = personas[i];
                results.push(completo);
            }
        }
        console.log('Results: '+JSON.stringify(results));

        return results;
    }

}
