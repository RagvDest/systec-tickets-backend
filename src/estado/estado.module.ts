import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Estado, EstadoSchema } from './estado.entity';
import { EstadoService } from './estado.service';

@Module({
    imports: [MongooseModule.forFeature([{name:Estado.name, schema:EstadoSchema}])],
    controllers:[],
    providers:[EstadoService]
})
export class EstadoModule {}