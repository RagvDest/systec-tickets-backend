import { BadRequestException, Body, Controller, Get, Patch, Post, Res, ValidationPipe } from '@nestjs/common';
import { UsuarioService } from 'src/usuario/usuario.service';
import { PedidoCreateDto } from './dto/pedido.create.dto';
import { Pedido} from './pedido.entity';
import { validate } from 'class-validator';
import { PedidoService } from './pedido.service';

@Controller('pedido')
export class PedidoController {
  constructor(
    private readonly pedidoService: PedidoService,
    private readonly usuarioService: UsuarioService) {}


  @Patch('update/:idPedido')
  async actualizarPedido(
    @Res() res,
    @Body('pedido') pedido:Pedido,
    @Body('idPedido') idPedido?
  ){
    try {
      const pedidoEncontrado = await this.pedidoService.findByID(idPedido); 
      if(pedidoEncontrado==null){
        res.status(400).send({error:'No existe pedido'});
                throw new BadRequestException('No existe pedido');
      }
      const ped = new PedidoCreateDto();
      ped.ped_fc_registro = pedido.ped_fc_registro;
      ped.usuario_id = pedido.usuario_id;

      const errores = await validate(ped);
      if(errores.length>0){
        console.error(errores);
        res.send({errores:errores});
      }
      const pedidoActualizado = await this.actualizarPedido(pedidoEncontrado['_id'],pedido);
      res.send({pedido:pedidoActualizado});
    } catch (error) {
      console.error(error);
    }

  }

  @Post('crear')
  async crearPedido(
      @Res() res,
      @Body('pedido') pedido:Pedido,
      @Body('id_usuario') id_usuario?
  ) {
    let usuario;
      try {
        usuario = this.usuarioService.findByID(id_usuario);
        const pedidoDto = new PedidoCreateDto();
        pedidoDto.ped_fc_registro = pedido.ped_fc_registro;
        pedido.usuario_id = pedido.usuario_id;

        const errores = await validate(pedidoDto);
        if(errores.length>0){
          console.error(errores);
          res.send({errores:errores});
        }else{
            const pedidoCreado = await this.pedidoService.create(pedido);
            res.send({pedidoCreado: pedidoCreado});
        }
      } catch (error) {
        console.error(error);
      }
  }

  @Get('all')
  async findAll(
      @Res() res?
  ) {
      
      const pedidos = await this.pedidoService.find();
      console.log(pedidos);
      res.send({results:pedidos});
  }

}
