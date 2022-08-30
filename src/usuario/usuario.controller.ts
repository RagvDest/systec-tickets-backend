import { BadRequestException, Body, Controller, Delete, Get, Headers, HttpException, HttpStatus, Logger, Param, Patch, Post, Query, Req, Res, UseGuards} from '@nestjs/common';
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
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Public } from 'src/auth/constants';
import { LocalCliAuthGuard } from 'src/auth/guards/local-cli-auth.guard';
import { LocalMockAuthGuard } from 'src/auth/guards/local-mock-emp-auth.guard';

var capitalize = require('capitalize')
const bcrypt = require('bcryptjs');
const saltRounds = 10;

@Controller('users')
export class UsuarioController{
    constructor(
        private readonly _usuarioServices:UsuarioService,
        private readonly _personaServices:PersonaService,
        private readonly _rolServices:RolService,
        private readonly _pedidoService:PedidoService,
        private readonly _authService:AuthService
    ){}

    private logger:Logger = new Logger('UsuarioController');

    @Get('logout')
    logout(
        @Res() res,
        @Req() req
    ){
      req.user = null;
      res.status(200).send({mensaje:"Ha cerrado su sesión"});
  }

  @Public()
  @Post('recover-pass')
  async recoverPass(
      @Res() res,
      @Body('mail') mail
  ){
      try {
        let user = await this._usuarioServices.findByPersonaID({u_mail:mail});
        if(user==null){
            res.status(400).send('No existe usuario');
            return;
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

        res.status(200).send({mensaje:'Si el correo indicado corresponde a una cuenta, se le enviará un enalce para recuperar su contraseña'});

      } catch (error) {
          this.logger.error("Recover Pass: "+error);
          res.status(500).send(error);
      }
  }


    @Public()
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
            usuario.u_activo = true;
            const usuarioActualizado = await this._usuarioServices.updateByID(idUsuario,usuario);
            res.status(200).send({usuarioActualizado,mensaje:"Contraseña guardada"});
        } catch (error) {
            this.logger.error("Change Password: "+error)
            res.status(500).send(error);
        }
    }
    
    @Public()
    @UseGuards(LocalCliAuthGuard)
    @Post('log-cli')
    async loginCustomers(
        @Res() res,
        @Req() req
    ){
        try {
            console.log(req.user)
            let persona = req.user.user.persona_id;
            let user =  req.user.user;
            
            let pedido = [{
                id_usuario:user._id,
                p_cedula:persona.p_cedula,
                p_nombres:persona.p_nombres+" "+persona.p_apellidos,
                p_tel:persona.p_tel,
                pedido:req.user.pedidos[0]
            }];
            const result = await this._authService.login(req.user,'cli');

            res.send({
                user:{
                    username:user,
                    rol:req.user.rol_id.r_rol, 
                    persona:persona
                },
                pedidos:pedido,
                access_token:result.access_token
            });

        } catch (error) {
            this.logger.error(`Log-Cli: ${error}`);
            res.status(500).send(error);
        }
    }

   /* @Get('profile')
    async example(
        @Req() req,
        @Res() res
    ){
        res.send(req.user);
    }*/

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('logIn')
    async logInUserPass(
        @Res() res,
        @Req() req
    ){
        try {
            console.log(req.user.rol_id);
            const result = await this._authService.login(req.user,'emp');
            const usuario = result.user.user;
            const rol = req.user.rol_id;
            usuario._id = result.user.id;
            res.send(
                {
                    user:{
                        username:usuario,
                        rol:rol.r_rol,
                        persona:usuario.persona_id
                    },
                    access_token:result.access_token
                }
            );
        } catch (error) {
            this.logger.error(`Log Emp: ${error}`);
            res.status(500).send(error);
        }
    }

    @Get('all')
    async buscarUsuarios(
        @Res() res,
        @Req() req,
        @Query('filtro') filtro?,
        @Query('input') input?,
        @Query('op') op?,
    ){
        input = input != null ? input.toLowerCase():'';
        if(req.user.data.rol_id.r_rol==='Cliente'){
            res.status(401).send();
            return;
        } 
        
        let param;
        if(filtro=='Username')
            param = {u_usuario: { $regex: '.*' + input + '.*', $options:'i' }}
        else if (filtro=='Correo')
            param = {u_mail: { $regex: '.*' + input + '.*', $options:'i' }}
        else if(filtro == 'Nombres')
            param = {p_nombres:{ $regex: '.*' + input + '.*', $options:'i' }}
        else if(filtro == 'Cédula')
            param = {p_cedula:{ $regex: '.*' + input + '.*', $options:'i' }}
        try {
            let rol = req.user.data.rol_id.r_rol === 'Empleado' ? 'emp' : 'all';
            const results = await this.llenarDatos(op,rol,param);    
            res.send({results:results});
        } catch (error) {
            this.logger.error("Find Users: "+error)
            res.status(500).send();
        }
        
        
    }

    @Patch('estado/:idUsuario')
    async cambiarEstado(
        @Res() res,
        @Param('idUsuario') idUsuario,
        @Req() req
    ){
        try {
            if(req.user.data.rol_id.r_rol==='Cliente'){
                res.status(401).send();
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
            this.logger.error(`Cambiar Estado: ${error}`);
            res.status(500).send(error);
        }
    }

    @Delete('del/:idUsuario')
    async eliminarUsuarioID(
        @Res() res,
        @Req() req,
        @Param('idUsuario') idUsuario:string
    ){
        if(req.user.data.rol_id.r_rol==='Cliente'){
            res.status(401).send();
            return;
        } 
        const eliminado = await this._usuarioServices.deleteUser(idUsuario);
        res.send({eliminado})
    }

    @Delete('delete')
    async eliminarPorQuery(
        @Res() res,
        @Req() req,
        @Query('mail') mail
    ){
        try {
            if(req.user.data.rol_id.r_rol==='Cliente'){
                res.status(401).send();
                return;
            }
            const eliminado = await this._usuarioServices.deleteUserByQuery({u_mail:mail});
            const pEliminado = await this._personaServices.deletePerson(eliminado.persona_id);
            res.send({eliminado:eliminado.u_mail});
        } catch (error) {
            this.logger.error('Eliminar x Query: '+error);
            res.status(500);
        }
    }
    
    @Post('postPlan')
    async postPlanDev(
        @Req() req,
        @Res() res,
        @Body('usuario') usuario:Usuario,
        @Body('persona') persona:Persona
    ){
        try {
            if(req.user.data.rol_id.r_rol==='Cliente'){
                res.status(401).send();
                return;
            }
            let creado = await this.crearPersona(res,persona);
            usuario.persona_id = creado;
            usuario.u_fc_registro = new Date();
            let rol = await this._rolServices.findOne({r_rol:'Administrador'});
            usuario.rol_id = rol;
            let sirCreated = await this._usuarioServices.create(usuario);
            var dateHash = new Date();
            var dateFormated = this._usuarioServices.fcConvert(dateHash);
            console.log(dateFormated);
            var hasheado = await bcrypt.hash(dateFormated, saltRounds);
            hasheado = hasheado.replace("/","");
            sirCreated.u_hash = hasheado;
            sirCreated = await this._usuarioServices.updateByID(sirCreated['_id'],sirCreated);
            await this.generarPassword(
                hasheado,sirCreated['_id'],
                sirCreated.u_mail,'Admin');
            res.status(201).send(sirCreated);
        } catch (error) {
            this.logger.error(`Error PostPlan: ${error}`);
            res.status(500).send('Error del servidor, comuniquese con el personal técnico.')
        }
    }

    @Post('crear')
    async crearUsuario(
        @Res() res,
        @Body('usuario') usuario:Usuario,
        @Body('persona') persona:Persona,
        @Body('rol') rol:string,
        @Req() req
    ){
        var id_persona;
        let usuarioCreado;
        try {
            if(req.user.data.rol_id.r_rol==='Cliente'){
                res.status(401).send();
                return;
            } 
            id_persona = await this.crearPersona(res,persona);
            usuario.persona_id = id_persona;
            usuario.u_usuario = usuario.u_usuario.toLowerCase();
            usuario.u_mail = usuario.u_mail.toLowerCase();
            usuario.u_fc_registro = new Date();
            console.log(capitalize(rol));
            const rol_id = await this._rolServices.findOne({r_rol:capitalize(rol)});
            console.log(rol_id);
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
                res.status(400).send('Error validación de campos');
                return;
            }else{
                usuario.u_activo = false;
                usuarioCreado = await this._usuarioServices.create(usuario);
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
            let errMensaje = 'Error al crear usuario con los datos proporcionados';
            this.logger.error("Error Crear Usuario: "+error);
            let code = 500;
            switch (error.code){
                case 11000:{
                    code=400
                    errMensaje = 'Usuario o Mail YA estan registrados';
                    break;
                }
            }

            // Eliminar persona
            if(id_persona!==undefined){
                await this._personaServices.deletePerson(id_persona['_id']);
                if(usuarioCreado!==undefined)
                    await this._usuarioServices.deleteByParam({persona_id:id_persona['_id']});
            }else{
                code = 400
            }
            res.status(code).send(errMensaje);
        }
    }

    @Post('test/:idP')
    async testFechaHash(
        @Body('persona') p,
        @Param('idP') idP
    ){
        const personaActualizada = await this._personaServices.updateByID(idP,p);
        return personaActualizada;
    }

    @Get(':idUsuario')
    async buscarUsuarioID(
        @Res() res,
        @Param('idUsuario') idUsuario:string,
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
            this.logger.error(error);
            res.status(400).send({error:error});
        }
    }

    @Patch('update/:idUsuario')
    async actualizarUsuario(
        @Res() res,
        @Req() req,
        @Body('usuario') usuario:Usuario,
        @Body('persona') persona:Persona,
        @Param('idUsuario') idUsuario?
    ){
        var idPersona;
        if(req.user.data.rol_id.r_rol==='Cliente' &&
        req.user.data._id !== idUsuario){
            res.status(401).send();
            return;
        } 
        try {
            console.log('aca estamos');
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
                persona.p_apellidos = persona.p_apellidos.toLowerCase();
                persona.p_nombres = persona.p_nombres.toLowerCase();

                usuario.u_usuario = usuario.u_usuario.toLowerCase();

                const personaActualizada = await this._personaServices.updateByID(idPersona,persona);
                const usuarioActualizado = await this._usuarioServices.updateByID(usuarioEncontrado['_id'],usuario);
                res.send({usuario:Object.assign(usuarioActualizado,usuario),persona:Object.assign(personaActualizada,persona)});
            }
        } catch (error) {
            this.logger.error(`Update Person: ${error}`);
            res.status(500).send(error);
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
                <a href='${process.env.BASE_URL}/#/generate-pass/${id_usuario}/${hash}' target='_blank'>Generar contraseña</a>
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
            throw new Error("Generar Password: "+error);
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
                throw new HttpException('Error en validación de campos',HttpStatus.BAD_REQUEST);
            }else{
                const personaCreada = await this._personaServices.crear(persona);
                return personaCreada;
            }
        } catch (error) {
            console.log(error);
            this.logger.error(`Crear Persona Met: ${error}`);
            throw new HttpException('Campos incorrectos',HttpStatus.BAD_REQUEST);
        }
    }

    async llenarDatos(
        op:string,
        rol,
        param?
    ){
        try {
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
                    let paramPersona = {persona_id:personas[i]._id};
                    usuario = await this._usuarioServices.findByPersonaID(paramPersona);
                    usuario.u_usuario=capitalize.words(usuario.u_usuario);
                    personas[i].p_apellidos = capitalize.words(personas[i].p_apellidos);
                    personas[i].p_nombres = capitalize.words(personas[i].p_nombres);
                    completo.username = usuario;
                    completo.persona = personas[i];
                    results.push(completo);
                }
           }
            return results;
        } catch (error) {
            return new Error(error);
        }
    }

}
