import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalCliStrategy extends PassportStrategy(Strategy,'local-cli'){
    constructor(private authService:AuthService){
        super({
            usernameField:'identificacion',
            passwordField:'orden'
        });
    }

    async validate(identificacion:string, orden:string):Promise<any>{
        const {user, status} = await this.authService.validateCli(identificacion, orden);

        if(!user){
            throw new UnauthorizedException({error:status});
        }
        return user;
    }
}