import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario, UsuarioDocument } from './usuario.entity';
import { UsuarioCreateDto } from './dto/usuario.create.dto';

const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const nodemailer = require("nodemailer");


@Injectable()
export class UsuarioService{
    constructor(@InjectModel(Usuario.name) private usuarioModel:Model<UsuarioDocument>){}

    async create(usuarioCreateDto:UsuarioCreateDto):Promise<Usuario>{
        const usuarioCreado = new this.usuarioModel(usuarioCreateDto);
        return usuarioCreado.save();
    }

    async find(param?):Promise<Usuario[]>{
        return this.usuarioModel.find(param).exec();
    }

    async deleteUser(id:string){
        return this.usuarioModel.findByIdAndDelete(id).exec();
    }

    async findByID(usuario_id?):Promise<Usuario>{
        return this.usuarioModel.findById(usuario_id).exec();
    }

    async updateByID(usuario_id?,query?):Promise<Usuario>{
        return this.usuarioModel.findByIdAndUpdate(usuario_id,query,{upsert:false});
    }

    async findByPersonaID(param?):Promise<Usuario>{
        return this.usuarioModel.findOne(param).populate({path:'persona_id'}).exec();
    }

    fcConvert = (fc) =>{
        let day = fc.getDate()<10 ? "0"+fc.getDate() : fc.getDate();
        let hours = fc.getHours()<10 ? "0"+fc.getHours() : fc.getHours();
        let minutes = fc.getMinutes()<10 ? "0"+fc.getMinutes() : fc.getMinutes();
        let seconds = fc.getSeconds()<10 ? "0"+fc.getSeconds() :fc.getSeconds();
        let time = hours+":"+minutes+":"+seconds;
        if(fc.getMonth()<9){
            return (day+"/"+"0"+(parseInt(fc.getMonth())+1)+"/"+fc.getFullYear()+" "+time)
        }else{
            return (day+"/"+fc.getMonth()+1+"/"+fc.getFullYear()+" "+time)
        }
    };

    async sendMail(from,to,asunto,texto,html){
        const myOAuth2Client = new OAuth2(
            process.env.CLIENT_ID,
            process.env.SECRET_ID,
            );
        
        myOAuth2Client.setCredentials({
            refresh_token:process.env.REFRESH_TOKEN
            });
        
        const myAccessToken = await myOAuth2Client.getAccessToken();
        
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.USER_MAIL, //your gmail account you used to set the project up in google cloud console"
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.SECRET_ID,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: myAccessToken //access token variable we defined earlier
        }});

          let info = await transporter.sendMail({
            from: `"Ragv Developer 👻" <${from}>`, // sender address
            to: `${to}`, // list of receivers
            subject: `${asunto} ✔`, // Subject line
            text: texto, // plain text body
            html: html // html body
          });

          console.log("Mensaje enviado: %s", info.messageId);
    }
}
