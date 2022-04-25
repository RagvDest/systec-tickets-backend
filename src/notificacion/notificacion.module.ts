import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Rol, RolSchema } from "src/rol/rol.entity";
import { RolService } from "src/rol/rol.service";
import { NotificacionController } from "./notificacion.controller";
import { Notificacion, NotificacionSchema } from "./notificacion.entity";
import { NotificacionService } from "./notificacion.service";

@Module({
    imports: [MongooseModule.forFeature([
        {name:Notificacion.name, schema:NotificacionSchema},
        {name:Rol.name, schema:RolSchema}
    ])],
    controllers:[NotificacionController],
    providers:[NotificacionService, RolService],
    exports:[NotificacionService]
})
export class NotificacionModule {}