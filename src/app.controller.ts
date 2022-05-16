import { Controller, Get, Logger, Res, Session } from '@nestjs/common';
import { AppService } from './app.service';
import { PedidoService } from './pedido/pedido.service';
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

  @Get('info')
  async getResumenEmployee(
    @Session() session,
    @Res() res
  ){
    try {
      let param = {}
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Get('dashboard')
  async getDashboard(
    @Res() res,
    @Session() session
  ){
    try {
      // Logic checkear solo Administrador
      let mes = new Date().getMonth()+1;
      console.log(mes);
      let pedidosMes = await this.pedidoService.findByDate(
        [
          {$addFields: {  "month" : {$month: '$ped_fc_registro'}}},
          {$match: { month: mes}}
        ]
      );
      let idPedidos = pedidosMes.map((it)=> {return (it['_id'])});
      let tickets = [], ticketsMes=[];
      for(let i=0;i<idPedidos.length;i++){
        tickets = [];
        tickets = await this.ticketService.findByPedidoID({pedido_id:idPedidos[i]});
        ticketsMes = ticketsMes.concat(tickets);
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
      console.log(txEquiposArray);

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
      console.log(txEstadosArray);

      let txEstados = estados.map((it)=>{
        return {
          estado:it,
          cantidad:parseFloat(((txEstadosArray.filter(x => x === it).length/txEstadosArray.length)*100).toFixed(2))
        };        
      })

      console.log(txEstados.sort((a,b)=>{return b.cantidad-a.cantidad}));


      res.send({totalVentas:totalVentas,txEquipos:txEquipos,txEstados:txEstados});
      
    } catch (error) {
      this.logger.error(`Dasboard: ${error}`);
    }
  }

}
