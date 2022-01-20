import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolController } from './rol.controller';
import { Rol, RolSchema } from './rol.entity';
import { RolService } from './rol.service';

@Module({
    imports: [MongooseModule.forFeature([{name:Rol.name, schema:RolSchema}])],
    controllers:[RolController],
    providers:[RolService]
})
export class RolModule {}