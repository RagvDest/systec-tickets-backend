import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { PedidoService } from 'src/pedido/pedido.service';
import { PersonaService } from 'src/persona/persona.service';
import { Usuario } from 'src/usuario/usuario.entity';
import { UsuarioService } from 'src/usuario/usuario.service';

const bcrypt = require('bcryptjs');

@Injectable()
export class AuthService {
    constructor(
        private usuarioService:UsuarioService,
        private pedidoService:PedidoService,
        private personaService:PersonaService,
        private jwService:JwtService
    ){}

    async validateUser(username:string,pass:string):Promise<any>{
        try {
            const user = await this.usuarioService.findOne({u_usuario:{ $regex: '.*' + username + '.*', $options:'i' }});
            const match = user && await bcrypt.compare(pass,user.u_password);
            if(user && user.u_activo && match){
                const result = {
                    id:user["_id"],
                    user:{
                        persona_id:user.persona_id,
                        u_mail:user.u_mail,
                        u_activo:user.u_activo,
                        u_usuario:user.u_usuario,
                        rol_id:user.rol_id
                    },
                    rol_id:user.rol_id
                };
                return result;
            }
        } catch (error) {
            return null;
        }
        
        
    }

    async validateCli(identificacion:string,orden:string):Promise<any>{
        let status = '200';
        let result={
            pedidos:[],
            user:{}
        };
        const persona = await this.personaService
                .findOneParam({p_cedula:identificacion});
        const user = await this.usuarioService
                .findOne({persona_id:persona});
        if(user == null) status = "Usuario no existe";
        else{
            if(user.rol_id.r_rol==="Empleado" || user.rol_id.r_rol==="Administrador") status = "Ingrese como empleado";
            else{
                let pedidos = await this.pedidoService.find({usuario_id:user,ped_nro_orden:orden});
                if(pedidos.length<1) status = 'Pedido no existe';
                else{
                    if(pedidos[0].ped_estado==="CERRADO") status = "PEDIDO CERRADO: "+this.usuarioService.fcConvert(pedidos[0].ped_fc_fin)
                    else{
                        let userAux = {
                            _id:user["_id"],
                            persona_id:user.persona_id,
                            u_mail:user.u_mail,
                            u_activo:user.u_activo,
                            u_usuario:user.u_usuario,
                            rol_id:user.rol_id
                        };
                        return {user:{user:userAux,rol_id:user.rol_id,codPedido:orden,pedidos:pedidos},status:status};
                    }
                }
            }
        }
        return {user:null,status:status};
    }

    async login(user:any,op?){
        const payload = user.user;
        payload.sub = op==='emp' ? user.id : user.user._id;
        const options:JwtSignOptions = {
            secret:process.env.JWT_SECRET,
            expiresIn:'2 days'
        }
        return {
            user:user,
            access_token:this.jwService.sign(payload,options)
        }
    }
}
