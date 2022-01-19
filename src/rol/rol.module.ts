import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rol, RolSchema } from './rol.entity';
import { RolService } from './rol.service';

@Module({
    imports: [MongooseModule.forFeature([{name:Rol.name, schema:RolSchema}])],
    controllers:[],
    providers:[RolService]
})
export class RolModule {}