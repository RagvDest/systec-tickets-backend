import { BadRequestException, Body, Controller, Get, Logger, Param, Patch, Post, Query, Res, Session, ValidationPipe } from '@nestjs/common';
import { UsuarioService } from 'src/usuario/usuario.service';
import { PedidoCreateDto } from './dto/pedido.create.dto';
import { Pedido} from './pedido.entity';
import { validate } from 'class-validator';
import { PedidoService } from './pedido.service';
import { PersonaService } from 'src/persona/persona.service';
import { RolService } from 'src/rol/rol.service';
import { Usuario } from 'src/usuario/usuario.entity';
import { Persona } from 'src/persona/persona.entity';

@Controller('pedido')
export class PedidoController {
  constructor(
    private readonly pedidoService: PedidoService,
    private readonly usuarioService: UsuarioService,
    private readonly _personaServices:PersonaService,
    private readonly _rolServices:RolService) {}

    private logger:Logger = new Logger('PedidoController');


  @Patch('update/:idPedido')
  async actualizarPedido(
    @Res() res,
    @Body('pedido') pedido:Pedido,
    @Session() session,
    @Param('idPedido') idPedido?
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
      const pedidoEncontrado = await this.pedidoService.findByID(idPedido); 
      if(pedidoEncontrado==null){
        res.status(400).send({error:'No existe pedido'});
        throw new BadRequestException('No existe pedido');
      }

      const ped = new PedidoCreateDto();
      ped.ped_fc_registro = new Date(pedido.ped_fc_registro);
      ped.usuario_id = pedidoEncontrado.usuario_id;

      const errores = await validate(ped);
      if(errores.length>0){
        console.error(errores);
        res.send({errores:errores});
      }else{
        console.log(pedidoEncontrado["_id"]);
        const pedidoActualizado = await this.pedidoService.updateByID(pedidoEncontrado['_id'],pedido);
        res.send({pedido:pedidoActualizado});
      }
    } catch (error) {
      this.logger.error(error);
    }

  }

  @Post('crear')
  async crearPedido(
      @Res() res,
      @Body('pedido') pedido:Pedido,
      @Session() session,
      @Body('id_usuario') id_usuario?
  ) {
    let usuario;
    let numTicket = Math.random().toString(36).substring(2, 5)+"-"+
                    Math.random().toString(36).substring(2, 5)+"-"+
                    Math.random().toString(36).substring(2, 5);
      try {
        if(await this._rolServices.isUserType(session,['Admin','Empleado'])){
          res.status(403).send({
            "statusCode": 403,
            "message": "Forbidden resource",
            "error": "Forbidden"
          });
          return;
        }
        usuario = await this.usuarioService.findByID(id_usuario);
        if(usuario===null){
          res.status(400).send({mensaje:"Usuario no existe"});
          throw new BadRequestException('Usuario no existe');
        }
        const pedidoDto = new PedidoCreateDto();
        pedidoDto.ped_fc_registro = new Date(pedido.ped_fc_registro);
        pedidoDto.usuario_id = usuario;
        pedido.usuario_id = usuario;
        pedido.ped_estado="ABIERTO";
        pedido.ped_nro_orden = numTicket.toUpperCase();

        const errores = await validate(pedidoDto);
        if(errores.length>0){
          console.error(errores);
          res.send({errores:errores});
        }else{
            const pedidoCreado = await this.pedidoService.create(pedido);
            res.send({pedidoCreado: pedidoCreado});
        }
      } catch (error) {
        this.logger.error(error);
      }
  }

  @Post('all')
  async findAll(
      @Res() res,
      @Session() session,
      @Body() body,
      @Query('filtro') filtro?,
      @Query('input') input?,
      @Query('orden') orden?,
      @Query('estado') estado?
  ) {
    let param;
    try {
      let results;
      if(await this._rolServices.isUserType(session,[])){
        console.log('Dent');
        res.status(403).send({
          "statusCode": 403,
          "message": "Forbidden resource",
          "error": "Forbidden"
        });
        return;
      }

      if(body.usuario.rol=='Cliente'){
        results = await this.pedidosCliente(body.usuario.username._id,body.usuario.persona);
        console.log(results);
        res.send({results:results})
        return;
      }else{
        if(filtro=='Nombres'){
          param = {p_nombres:{ $regex: '.*' + input + '.*' }}
        }else if(filtro=='Cédula'){
          param = {p_cedula:{ $regex: '.*' + input + '.*' }}
        }
        results = await this.llenarDatos(param,orden,estado);
        res.send({results:results});
      }
    } catch (error) {
      this.logger.error(error);
    }
      
  }

  async pedidosCliente(
    id_usuario,
    persona:Persona
  ){
    let results = await this.pedidoService.findByParam({usuario_id:id_usuario});
    let completo = {
      pedido:results,
      p_nombres:persona.p_nombres+' '+persona.p_apellidos,
      p_cedula:persona.p_cedula,
      id_usuario:id_usuario,
      p_tel:persona.p_tel
    };
    return [completo];
  }

  async llenarDatos(
    param:string,
    orden?,
    estado?
  ){
    let results = [];
    let personas, usuario, pedidos;
    let completo = {
      pedido:{},
      p_nombres:"",
      p_cedula:"",
      id_usuario:"",
      p_tel:""
    }
    personas = await this._personaServices.findAll(param);
    for(var i=0;i<personas.length;i++){
      completo = {
        pedido:{},
        p_nombres:"",
        p_cedula:"",
        id_usuario:"",
        p_tel:""
      };
      usuario = await this.usuarioService.findByPersonaID({persona_id:personas[i]._id});
      let query;
      if(estado==="TODOS" || estado==="" || estado==null)
        query = {usuario_id:usuario['_id']};
      else
        query = {usuario_id:usuario['_id'], ped_estado:estado};
      pedidos = await this.pedidoService.find(query,orden);
      
      for(var u=0;u<pedidos.length;u++){
        console.log(u);
        completo.pedido = pedidos[u];
        completo.p_nombres = personas[i].p_nombres+" "+personas[i].p_apellidos;
        completo.p_cedula = personas[i].p_cedula;
        completo.id_usuario = usuario['_id'];
        completo.p_tel = personas[i].p_tel;
        results.push(completo);
      }
    }
    return results;
  }

}
