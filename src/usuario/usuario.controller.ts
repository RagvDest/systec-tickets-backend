import { BadRequestException, Body, Controller, Delete, Get, Headers, Logger, Param, Patch, Post, Query, Res, Session} from '@nestjs/common';
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
import { PedidoService } from 'src/pedido/pedido.service';

var capitalize = require('capitalize')
const bcrypt = require('bcryptjs');
const saltRounds = 10;

@Controller('users')
export class UsuarioController{
    constructor(
        private readonly _usuarioServices:UsuarioService,
        private readonly _personaServices:PersonaService,
        private readonly _rolServices:RolService,
        private readonly _pedidoService:PedidoService
    ){}

    private logger:Logger = new Logger('UsuarioController');

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

  @Post('recover-pass')
  async recoverPass(
      @Res() res,
      @Body('mail') mail
  ){
      try {
        let user = await this._usuarioServices.findByPersonaID({u_mail:mail});
        if(user==null){
            res.status(200).send({});
        }
        const id_persona = user.persona_id;
        var dateHash = new Date();
        var dateFormated = this._usuarioServices.fcConvert(dateHash);
        console.log(dateFormated);
        var hasheado = await bcrypt.hash(dateFormated, saltRounds);
        hasheado = hasheado.replace("/","");
        user.u_hash = hasheado;
        user = await this._usuarioServices.updateByID(user['_id'],user);
        await this.generarPassword(
            hasheado,user['_id'],
            user.u_mail,id_persona.p_nombres);

        res.status(200).send({});

      } catch (error) {
          this.logger.error("Recover Pass: "+error);
      }
  }


    @Post('pass')
    async cambiarPassword(
        @Res() res,
        @Body('pass') pass,
        @Body('user_id') idUsuario,
        @Body('hash_id') hash
    ){
        //Pendiente implementar el código por mail
        try {
            const usuario = await this._usuarioServices.findByID(idUsuario);
            if(usuario == null){
                res.status(400).send({error:'No existe usuario'});
                throw new Error("No existe usuario");
            }
            if(usuario.u_hash==='hash'){
                res.status(400).send({error:'Operación no autorizada'});
                throw new Error("Operación no autorizada");
            }
            let hash = await bcrypt.hash(pass, saltRounds);
            usuario.u_password = hash;
            usuario.u_hash="";
            const usuarioActualizado = await this._usuarioServices.updateByID(idUsuario,usuario);
            res.status(200).send({usuarioActualizado,mensaje:"Contraseña guardada"});
        } catch (error) {
            this.logger.error("Change Password: "+error)
        }
    }
    
    @Post('log-cli')
    async loginCustomers(
        @Res() res,
        @Body('identificacion') ident,
        @Body('orden') nOrden,
        @Session() session
    ){
        try {
            let persona = await this._personaServices
                .findOneParam({p_cedula:ident});
            let usuario = await this._usuarioServices
                .findByPersonaID({persona_id:persona});
                
            if(usuario==null){
                res.send({mensaje:"Usuario no existe"});
                return;
            }
            let rol = await this._rolServices.findByID(usuario.rol_id);
            if (rol.r_rol=="Empleado"){
                res.send({mensaje:"Ingrese como empleado"});
                return;
            }
            let pedidos = await this._pedidoService.find({usuario_id:usuario,ped_nro_orden:nOrden});
            

            if(pedidos.length<1){
                res.send({pedidos:[]});
                return;
            }
            if(pedidos[0].ped_estado=="CERRADO"){
                res.send({mensaje:"PEDIDO CERRADO: "+this._usuarioServices.fcConvert(pedidos[0].ped_fc_fin)});
                return;
            }
            this.logger.debug("Nada");

            let usuarioSession = {
                _id:usuario["_id"],
                persona_id:usuario.persona_id,
                u_mail:usuario.u_mail,
                u_activo:usuario.u_activo,
                u_usuario:usuario.u_usuario
            };

            session.usuario = usuarioSession;
            session.rol = rol;
            session.codPedido = nOrden;
            res.send({
                user:{
                    username:session.usuario,
                    rol:session.rol.r_rol, 
                    persona:persona
                },
                pedidos:pedidos
            });

        } catch (error) {
            this.logger.error(error);
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
            let usuarioArr = await this._usuarioServices.find({u_usuario:username.toLowerCase()});
            let usuario = usuarioArr[0];
            if(usuario==null){
                res.status(400).send({mensaje:"Error al iniciar sesión. Revise su usuario y contraseña"});
                throw new Error("Error al iniciar sesión. Revise su usuario1 y contraseña");
            }
            this.logger.debug(JSON.stringify(usuario));
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
                console.log(session);
                res.send({usuario:session.usuario,rol:session.rol.r_rol, persona:persona});
            }
            else{
                res.status(400).send({mensaje:"Error al iniciar sesión. Revise su usuario y contraseña"});
                throw new Error("Error al iniciar sesión. Revise su usuario y contraseña");
            }
        } catch (error) {
            this.logger.error(error)
            return;
        }
    }

    @Get('all')
    async buscarUsuarios(
        @Res() res,
        @Session() session,
        @Query('filtro') filtro?,
        @Query('input') input?,
        @Query('op') op?,
    ){
        input = input != null ? input.toLowerCase():'';
        console.log(session.rol);
        if(await !this._rolServices.isUserType(session,['Admin','Empleado'])){
            console.log("Dentro");
            res.status(403).send({
              "statusCode": 403,
              "message": "Forbidden resource",
              "error": "Forbidden"
            });
            return;
          }
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
            this.logger.error(error)
            res.status(500).send();
        }
        
        
    }

    @Patch('estado/:idUsuario')
    async cambiarEstado(
        @Res() res,
        @Param('idUsuario') idUsuario,
        @Session() session
    ){
        try {
            if(await this._rolServices.isUserType(session,['Admin','Empleado'])){
                res.status(403).send({
                  "statusCode": 403,
                  "message": "Forbidden resource",
                  "error": "Forbidden"
                });
                return;
              }
            const usuarioEncontrado = await this._usuarioServices.findByID(idUsuario);
            if(usuarioEncontrado==null){
                res.status(400).send({error:'Usuario no existe'});
                throw new Error("Usuario no existe");
            }
            usuarioEncontrado.u_activo = !usuarioEncontrado.u_activo;
            const usuarioActualizado = await this._usuarioServices.updateByID(idUsuario,usuarioEncontrado);
            res.status(200).send(usuarioActualizado);

        } catch (error) {
            this.logger.error(error)
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
        @Body('rol') rol:string,
        @Session() session
    ){
        var id_persona;
        try {
            if(await !this._rolServices.isUserType(session,['Admin','Empleado'])){
                res.status(403).send({
                  "statusCode": 403,
                  "message": "Forbidden resource",
                  "error": "Forbidden"
                });
                return;
              }
            id_persona = await this.crearPersona(res,persona);
            usuario.persona_id = id_persona;
            usuario.u_usuario = usuario.u_usuario.toLowerCase();
            usuario.u_mail = usuario.u_mail.toLowerCase();
            console.log(rol);
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
                let usuarioCreado = await this._usuarioServices.create(usuario);
                if(rol_id.r_rol==='Empleado'){
                    var dateHash = new Date();
                    var dateFormated = this._usuarioServices.fcConvert(dateHash);
                    console.log(dateFormated);
                    var hasheado = await bcrypt.hash(dateFormated, saltRounds);
                    hasheado = hasheado.replace("/","");
                    usuarioCreado.u_hash = hasheado;
                    usuarioCreado = await this._usuarioServices.updateByID(usuarioCreado['_id'],usuarioCreado);
                    await this.generarPassword(
                        hasheado,usuarioCreado['_id'],
                        usuarioCreado.u_mail,id_persona.p_nombres);
                }
                res.send({ok:true,usuario:usuarioCreado,persona:id_persona,rol:rol_id})
            }
        } catch (error) {
            this.logger.error("Error Crear Usuario: "+error);
            // Eliminar persona
            await this._personaServices.deletePerson(id_persona['_id']);
            res.status(500).send({});
        }
    }

    @Post('test')
    async testFechaHash(){
        var dateHash = new Date();
        var dateFormated = this._usuarioServices.fcConvert(dateHash);
        console.log(dateFormated);
        var hasheado = await bcrypt.hash(dateFormated, saltRounds);
        console.log(hasheado);
    }

    @Get(':idUsuario')
    async buscarUsuarioID(
        @Res() res,
        @Param('idUsuario') idUsuario:string,
        @Session() session
    ){
        try {
            if(await this._rolServices.isUserType(session,[])){
                res.status(403).send({
                  "statusCode": 403,
                  "message": "Forbidden resource",
                  "error": "Forbidden"
                });
                return;
              }
            const usuarioEncontrado = await this._usuarioServices.findByID(idUsuario);
            if(usuarioEncontrado==null){
                res.status(400).send({error:'No existe usuario'});
                throw new BadRequestException('No existe usuario');
            }
            const personaEncontrada = await this._personaServices.findByID(usuarioEncontrado.persona_id);
            const rolEncontrado = await this._rolServices.findByID(usuarioEncontrado.rol_id);
            res.send({usuario:usuarioEncontrado, persona:personaEncontrada, rol:rolEncontrado});
        } catch (error) {
            this.logger.error(error);
            res.status(400).send({error:error});
        }
    }

    @Patch('update/:idUsuario')
    async actualizarUsuario(
        @Res() res,
        @Body('usuario') usuario:Usuario,
        @Body('persona') persona:Persona,
        @Session() session,
        @Param('idUsuario') idUsuario?
    ){
        var idPersona;
        try {
            if(await !this._rolServices.isUserType(session,['Admin','Cliente'])){
                res.status(403).send({
                  "statusCode": 403,
                  "message": "Forbidden resource",
                  "error": "Forbidden"
                });
                return;
              }
                  
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
            this.logger.error(error)
            // Eliminar persona
        }
    }

    async generarPassword(
        hash,
        id_usuario,
        mail_usuario,
        nombres
    ){
        try {
            console.log(process.env.USER_MAIL);
            await this._usuarioServices.sendMail(
                "ragvdr4develop@gmail.com",
                mail_usuario,
                "Generar contraseña",
                "",
                `<b>Hola ${nombres}!</b>
                <br/>
                Se generó una solicitud para registrar su contraseña. Si usted lo solicitó por favor ingrese al siguiente enlace:
                <br/>
                <a href='${process.env.BASE_URL}/generate-pass/${id_usuario}/${hash}' target='_blank'>Generar contraseña</a>
                <br/>
                <br/>
                Si usted no solicitó un cambio de contraseña, por favor ignore este correo.
                <br/>
                <br/>
                <br/>
                Saludos cordiales`);

            this.logger.debug("Mensaje Enviado a: "+mail_usuario);
            return true;
        } catch (error) {
            this.logger.error("Generar Password: "+error);
            return false;
        }
    }

    // COMPLEMENTOS
    async crearPersona(
        @Res() res,
        persona:Persona
    ){
        persona.p_nombres=persona.p_nombres.toLowerCase();
        persona.p_apellidos=persona.p_apellidos.toLowerCase();

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
            this.logger.error(error)
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
                usuarios[i].u_usuario=capitalize.words(usuarios[i].u_usuario);
                persona.p_apellidos = capitalize.words(persona.p_apellidos);
                persona.p_nombres = capitalize.words(persona.p_nombres);
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
                usuario.u_usuario=capitalize.words(usuario.u_usuario);
                personas[i].p_apellidos = capitalize.words(personas[i].p_apellidos);
                personas[i].p_nombres = capitalize.words(personas[i].p_nombres);
                completo.username = usuario;
                completo.persona = personas[i];
                results.push(completo);
            }
        }
        console.log('Results: '+JSON.stringify(results));

        return results;
    }

}
