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
      session.usuarioNombre=undefined;
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
        try {
            console.log(username);
            console.log(pass);
            const usuario = await this._usuarioServices.find({u_usuario:username});
            if(usuario.length<=0){
                res.status(400).send({mensaje:"Error al iniciar sesión. Revise su usuario y contraseña"});
                throw new Error("Error al iniciar sesión. Revise su usuario y contraseña");
            }
            const match = await bcrypt.compare(pass,usuario[0].u_password);
            if(match){
                session.usuario = usuario[0];
                let rol = await this._rolServices.findByID(usuario[0].rol_id);
                session.rol = rol;
                res.send({mensaje:"Bienvenido!", usuario:session.usuario.u_usuario,rol:session.rol.r_rol});
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
        @Query('mail') mail?,
        @Query('user') user?
    ){
        console.log(user);
        let param = {u_usuario: user}
        try {
            const results =[];
            const usuarios = await this._usuarioServices.find(param);
            for(var i=0;i<usuarios.length;i++)
                results.push(await this.llenarDatos(usuarios[i]));
            
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
        @Body('persona') persona:Persona
    ){
        var id_persona;
        try {
            id_persona = await this.crearPersona(res,persona);
            usuario.persona_id = id_persona;

            const rol_id = await this._rolServices.findByID(usuario.rol_id);
            usuario.rol_id = rol_id;
            
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
                const usuarioCreado = await this._usuarioServices.create(usuario);
                res.send({usuarioCreado:usuarioCreado})
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
        user:Usuario
    ){
        const completo={
            usuario:{},
            persona:{}
        };
        let persona = await this._personaServices.findByID(user.persona_id);
        completo.usuario = user;
        completo.persona = persona;
        return completo;
    }

}
