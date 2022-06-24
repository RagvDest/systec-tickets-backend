import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy,'local-mock-emp'){
    constructor(){
        super();
    }

    async validate(username:string, password:string):Promise<any>{
        const user = {
            id:'123',
            user:{
                persona_id:{
                    _id:'123',
                    p_nombres:'Test Teo',
                    p_apellidos:'Apellido Test',
                    p_cedula:1713175071
                },
                u_mail:'ragvdr4develop@gmail.com',
                u_activo:true,
                u_usuario:'Test',
                rol_id:{
                    _id:'123',
                    r_rol:'Empleado'
                }
            },
            rol_id:{
                _id:'123',
                r_rol:'Empleado'
            }
        }
        return user;
    }
}