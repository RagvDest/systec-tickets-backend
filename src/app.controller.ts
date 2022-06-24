import { Controller, Get, Logger, Req, Res, Session } from '@nestjs/common';
import { AppService } from './app.service';
import { PedidoService } from './pedido/pedido.service';
import { PersonaService } from './persona/persona.service';
import { TicketService } from './ticket/ticket.service';
import { UsuarioService } from './usuario/usuario.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UsuarioService,
    private readonly ticketService: TicketService,
    private readonly pedidoService: PedidoService
    ) {}

  private logger:Logger = new Logger('AppController');

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('dashboard')
  async getDashboard(
    @Res() res,
    @Req() req
  ){
    try {
      // Por ahora, checkear que no sea Cliente
      if( req.user.data.rol_id.r_rol === 'Cliente' ){
        res.status(401).send();
        return;
    } 
    //Conseguir mes 
      let fecha = new Date();
      let mes = fecha.getMonth()+1;

      // Get rango del mes actual
      let [fcMin, fcMax] = this.userService.getMinMaxDateRange(fecha);

      console.log(mes);
      let pedidosMes = await this.pedidoService.findByDate(
        [
          {$addFields: {  "month" : {$month: '$ped_fc_registro'}}},
          {$match: { month: mes}}
        ]
      );

      // Get Usuarios nuevos
      
      let usuariosMes = await this.userService.countByMonth({u_fc_registro:{$gte:fcMin,$lte:fcMax}});
      this.logger.debug(`Fecha: ${fcMax}`);

      [fcMin, fcMax] = this.userService.getMinMaxDateRange(fecha,true);
      let userMesPasado = await this.userService.countByMonth({u_fc_registro:{$gte:fcMin,$lte:fcMax}});
      this.logger.debug(`Fecha: ${fcMax}`);
      let porcentaje = usuariosMes === userMesPasado ? 0 : ((usuariosMes-userMesPasado)/userMesPasado)*100;
      this.logger.debug(`Usuarios ahorita: ${usuariosMes}`);
      this.logger.debug(`Usuarios antes: ${userMesPasado}`);
      this.logger.debug(`Porcentaje: ${porcentaje}`);

      // Pedidos Activos
      let pActivos = await this.pedidoService.countByEstado({ped_estado:{$not:/CERRADO/}});
      
      // Tickets por Cliente
      let idPedidos = pedidosMes.map((it)=> {
        let persona = it.usuario_id.persona_id;
        return {
          id:it['_id'],
          usuario:{
            nombres:`${persona.p_nombres}`,
            id:it.usuario_id['_id']
          }
      }
      });
      let txCliente = {
        cliente:"",
        num:0
      };
      let ticks = [], ticketsMes=[], txClienteArray=[];
      for(let i=0;i<idPedidos.length;i++){
        ticks = [];
        ticks = await this.ticketService.findByPedidoID({pedido_id:idPedidos[i].id});
        ticketsMes = ticketsMes.concat(ticks);

        txCliente = {
          cliente:"",
          num:0
        };

        let indexCheck = txClienteArray.findIndex((it,index)=>{
          if(it.cliente===idPedidos[i].usuario.nombres)
            return true;
        })
        if(indexCheck!=-1){
          txClienteArray[indexCheck].num = txClienteArray[indexCheck].num + ticks.length;
        }else{
          txCliente.cliente = idPedidos[i].usuario.nombres;
          txCliente.num = ticks.length;
          txClienteArray.push(txCliente);
        }
      }

      // Ventas por Mes
      let totalVentasArray = ticketsMes.map((it)=>{
          return it.t_abono;
      });
      const reducer = (a,b) =>{
        return a+b;
      };
      let totalVentas = totalVentasArray.length>0 ? totalVentasArray.reduce(reducer):0;

      // Tickets por Equipo
      let txEquiposArray = ticketsMes.map((it)=>{
        return  it.t_tipo_equipo
      });

      let equipos = [...new Set(txEquiposArray)];

      txEquiposArray.filter(x => x === equipos[0]).length;

      let txEquipos = equipos.map((it)=>{
        return {
          equipo:it,
          cantidad:txEquiposArray.filter(x => x === it).length
          // PARA PORCENTAJE cantidad:parseFloat(((txEquiposArray.filter(x => x === it).length/txEquiposArray.length)*100).toFixed(2))
        };        
      })

      // Tickets por Estado
      let txEstadosArray = ticketsMes.map((it)=>{
        return  it.t_estado
      });

      let estados = [...new Set(txEstadosArray)];

      txEstadosArray.filter(x => x === estados[0]).length;

      let txEstados = estados.map((it)=>{
        return {
          estado:it,
          cantidad:parseFloat(((txEstadosArray.filter(x => x === it).length/txEstadosArray.length)*100).toFixed(2))
        };        
      });

      
      res.send({
        totalVentas:totalVentas,
        txEquipos:txEquipos,
        txEstados:txEstados,
        txClientes:txClienteArray,
        txActivos:pActivos,
        nUsers:{
          n:usuariosMes,
          p:porcentaje
        }
      });
    } catch (error) {
      this.logger.error(`Dasboard: ${error}`);
      res.status(500).send("Algo salió mal en el servidor");
    }
  }

}
