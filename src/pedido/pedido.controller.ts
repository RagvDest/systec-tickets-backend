import { BadRequestException, Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, Req, Res } from '@nestjs/common';
import { UsuarioService } from 'src/usuario/usuario.service';
import { PedidoCreateDto } from './dto/pedido.create.dto';
import { Pedido} from './pedido.entity';
import { validate } from 'class-validator';
import { PedidoService } from './pedido.service';
import { PersonaService } from 'src/persona/persona.service';
import { RolService } from 'src/rol/rol.service';
import { Usuario } from 'src/usuario/usuario.entity';
import { Persona } from 'src/persona/persona.entity';
import { TicketService } from 'src/ticket/ticket.service';
import { EstadoService } from 'src/estado/estado.service';
import { Ticket } from 'src/ticket/ticket.entity';
import { NotificacionService } from 'src/notificacion/notificacion.service';
var capitalize = require('capitalize')


@Controller('pedido')
export class PedidoController {
  constructor(
    private readonly pedidoService: PedidoService,
    private readonly usuarioService: UsuarioService,
    private readonly _personaServices:PersonaService,
    private readonly _ticketServices:TicketService,
    private readonly _estadoServices:EstadoService,
    private readonly _rolServices:RolService,
    private readonly notifiService:NotificacionService
    ) {}

    private logger:Logger = new Logger('PedidoController');


  @Patch('update/:idPedido')
  async actualizarPedido(
    @Res() res,
    @Body('pedido') pedido:Pedido,
    @Req() req,
    @Param('idPedido') idPedido?
  ){
    try {
      if(req.user.data.rol_id.r_rol==='Cliente'){
        res.status(401).send();
        return;
    } 
      const pedidoEncontrado = await this.pedidoService.findByID(idPedido); 
      if(pedidoEncontrado==null){
        res.status(400).send({error:'No existe pedido'});
        throw new BadRequestException('No existe pedido');
      }

      const ped = new PedidoCreateDto();
      ped.ped_fc_registro = new Date(pedido.ped_fc_registro);
      ped.ped_nro_orden = pedido.ped_nro_orden;
      ped.ped_estado = pedido.ped_estado;
      ped.usuario_id = pedidoEncontrado.usuario_id;

      const errores = await validate(ped);
      if(errores.length>0){
        res.status(400).send({errores:errores});
      }else{
        let tickets:Ticket[];
        if(pedido.ped_estado=='CERRADO'){
          await this.crearEstadoCerrado(pedido,tickets,idPedido);
        }
        let notifi = await this.notifiService.generateNotifi("Pedido",pedido.ped_nro_orden,"Estado o fecha de entrega editada",pedidoEncontrado.usuario_id,pedidoEncontrado['_id']);
        const pedidoActualizado = await this.pedidoService.updateByID(pedidoEncontrado['_id'],pedido);
        res.send({pedido:Object.assign(pedidoActualizado,pedido),tickets:tickets,notificacion:notifi});
      }
    } catch (error) {
      this.logger.error(error);
      this.logger.error("update")
      res.status(500).send(error);
    }

  }

  @Post('crear')
  async crearPedido(
      @Res() res,
      @Body('pedido') pedido:Pedido,
      @Req() req,
      @Body('id_usuario') id_usuario?
  ) {
    let usuario;
    let numTicket = Math.random().toString(36).substring(2, 5)+"-"+
                    Math.random().toString(36).substring(2, 5)+"-"+
                    Math.random().toString(36).substring(2, 5);
      try {
        if(req.user.data.rol_id.r_rol==='Cliente'){
          res.status(401).send();
          return;
        } 
        usuario = await this.usuarioService.findByID(id_usuario);
        if(usuario===null){
          res.status(400).send({mensaje:"Usuario no existe"});
          throw new BadRequestException('Usuario no existe');
        }
        pedido.ped_estado="ABIERTO";
        pedido.ped_nro_orden = numTicket.toUpperCase();

        const pedidoDto = new PedidoCreateDto();
        pedidoDto.ped_fc_registro = new Date(pedido.ped_fc_registro);
        pedidoDto.usuario_id = usuario;
        pedidoDto.ped_estado = pedido.ped_estado;
        pedidoDto.ped_nro_orden = pedido.ped_nro_orden;
        pedido.usuario_id = usuario;
        

        const errores = await validate(pedidoDto);
        if(errores.length>0){
          res.status(400).send("Error al registrar pedido con esos datos");
        }else{
            const pedidoCreado = await this.pedidoService.create(pedido);
            res.send({pedidoCreado: pedidoCreado});
        }
      } catch (error) {
        this.logger.error(error);
        res.status(500).send(error);
      }
  }

  @Post('all')
  async findAll(
      @Res() res,
      @Req() req,
      @Body() body,
      @Query('filtro') filtro?,
      @Query('input') input?,
      @Query('orden') orden?,
      @Query('estado') estado?
  ) {
    let param;

    try {
      let results;
      if(req.user.data.rol_id.r_rol==='Cliente'){
        res.status(401).send();
        return;
    } 
      if(body.usuario && body.usuario.rol=='Cliente'){
        results = await this.pedidosCliente(
          body.usuario.username._id,
          body.usuario.persona,
          req.user.data.codPedido);
        this.logger.debug("Cargando pedidos del cliente");
        res.send({results:results})
        return;
      }else{
        input = input == null ? '' : input.toLowerCase();
        if(filtro=='Nombres'){
          param = {p_nombres:{ $regex: '.*' + input + '.*', $options:'i' }}
        }else if(filtro=='Cédula'){
          param = {p_cedula:{ $regex: '.*' + input + '.*', $options:'i' }}
        }
        
        results = await this.llenarDatos(param,orden,estado);
        
        res.status(200).send({results:results});
      }
    } catch (error) {
      this.logger.error(error);
      res.status(500).send(error);
    }
  }

  @Get('info/:idPedido')
  async getInfoPedido(
    @Req() req,
    @Res() res,
    @Param('idPedido') pedido_id
  ){
    try {
      let pedido = await this.pedidoService.findByIdComplete(pedido_id,{path:'usuario_id',populate:{path:'persona_id'}});
      let result = {
        id_usuario:pedido.usuario_id['_id'],
        p_cedula:pedido.usuario_id.persona_id.p_cedula,
        p_nombres:(pedido.usuario_id.persona_id.p_nombres+' '+pedido.usuario_id.persona_id.p_apellidos),
        pedido:pedido
      }
      res.send(result);
    } catch (error) {
      this.logger.error("GetInfoPedido: "+error);
      res.status(500).send(error);
    }
  }

  @Delete('/del/:idPedido')
  async eliminarPedido(
    @Req() req,
    @Res() res,
    @Param('idPedido') idPedido
  ){
    try {
      if(req.user.data.rol_id.r_rol==='Cliente'){
        res.status(401).send();
        return;
    } 
    let pedidoEliminado = await this.pedidoService.deleteById(idPedido);
    res.status(200).send(pedidoEliminado);
    } catch (error) {
      this.logger.error(`Error eliminando: ${error}`);
      res.status(500).send(error);
    }
  }

  @Get('tpendiente')
  async getTrabajosPendientes(
    @Req() req,
    @Res() res
  ){
    try {
      if(req.user.data.rol_id.r_rol==='Cliente'){
        res.status(401).send();
        return;
      } 
      let param = {ped_estado:{$not:/CERRADO/}};
      let sortParam = {ped_fc_fin:'asc'};
      let populateParam = {path:'usuario_id',populate:{path:'persona_id'}};

      let pedidos = await this.pedidoService.find(param,sortParam,populateParam);
      let results = [];
      for(var u=0;u<pedidos.length;u++){
        let pedido = {
          ped_fc_fin:null,
          ped_nro_orden:null,
          usuario_id:null,
          _id:null,
          ped_nro_tickets:null
        };
        let ped = pedidos[u];
        pedido.ped_fc_fin = ped.ped_fc_fin;
        pedido.ped_nro_orden = ped.ped_nro_orden;
        pedido.usuario_id = ped.usuario_id;
        pedido._id = ped['_id'];
        let countTickets = await this._ticketServices.countTickets({pedido_id:pedido['_id']})
        pedido.ped_nro_tickets = countTickets;
        results.push(pedido);
      }
      
      res.send(results);
    } catch (error) {
      this.logger.error(error);
      this.logger.error("TPendientess");
      res.status(500).send(error);
    }
  }

  async crearEstadoCerrado(
    pedido:Pedido,
    tickets:Ticket[],
    idPedido:string
  ){
    
    pedido.ped_fc_fin = new Date();
    let updated = await this._ticketServices.cerrarTicketsByPedidoID(idPedido);
    tickets = await this._ticketServices.findByPedidoID({pedido_id:idPedido});
    let estados = [];
    for(let i=0;i<tickets.length;i++){
      let ticket = tickets[i];
      let param = {ticket_id:ticket['_id']};
      let lastEstado = await this._estadoServices.findLast(param);
      let estado = {
        e_nombre:"CERRADO",
        e_detalle:"PEDIDO CERRADO",
        e_usuario:"Sistema",
        e_secuencial:lastEstado==null ? 0 : lastEstado.e_secuencial+1,
        user_id: null,
        ticket_id:ticket['_id']
      }
      estados.push(estado);
    };
    estados.forEach(async (it)=>{
      await this._estadoServices.create(it);
    })
  }

  async pedidosCliente(
    id_usuario,
    persona:Persona,
    codPedido
  ){
    let results = await this.pedidoService.find({usuario_id:id_usuario,ped_nro_orden:codPedido});
    let completo = {
      pedido:results[0],
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
      pedido:{nTickets:0},
      p_nombres:"",
      p_cedula:"",
      id_usuario:"",
      p_tel:""
    }
    personas = await this._personaServices.findAll(param);
    for(var i=0;i<personas.length;i++){
      
      usuario = await this.usuarioService.findByPersonaID({persona_id:personas[i]._id});
      let query;
      if(estado==="TODOS" || estado==="" || estado==null)
        query = {usuario_id:usuario['_id']};
      else
        query = {usuario_id:usuario['_id'], ped_estado:estado};
      pedidos = await this.pedidoService.find(query,{ped_fc_registro:orden});

      for(var u=0;u<pedidos.length;u++){
        completo = {
          pedido:{
            nTickets:0
          },
          p_nombres:"",
          p_cedula:"",
          id_usuario:"",
          p_tel:""
        };
        completo.pedido = pedidos[u];
        completo.pedido.nTickets = await this._ticketServices.countTickets({pedido_id:pedidos[u]._id});
        completo.p_nombres = capitalize.words(personas[i].p_nombres+" "+personas[i].p_apellidos);
        completo.p_cedula = personas[i].p_cedula;
        completo.id_usuario = usuario['_id'];
        completo.p_tel = personas[i].p_tel;
        results.push(completo);
      }
    }
    if(orden=="asc"){
      results.sort(this.sortAsc);
    }else{
      results.sort(this.sortDesc);
    }
    return results;
  }

  sortDesc(a,b){
    return new Date(a.pedido.ped_fc_fin).getTime()-new Date(b.pedido.ped_fc_fin).getTime();
  }
  sortAsc(a,b){
    return new Date(b.pedido.ped_fc_fin).getTime()-new Date(a.pedido.ped_fc_fin).getTime();
  }

}
