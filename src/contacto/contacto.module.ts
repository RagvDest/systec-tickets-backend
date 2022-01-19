import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Contacto, ContactoSchema } from './contacto.entity';
import { ContactoService } from './contacto.service';

@Module({
    imports: [MongooseModule.forFeature([{name:Contacto.name, schema:ContactoSchema}])],
    controllers:[],
    providers:[ContactoService]
})
export class ContactoModule {}