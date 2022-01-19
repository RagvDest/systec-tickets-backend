import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Persona, PersonaSchema } from './persona.entity';
import { PersonaService } from './persona.service';

@Module({
    imports: [MongooseModule.forFeature([{name:Persona.name, schema:PersonaSchema}])],
    controllers:[],
    providers:[PersonaService]
})
export class PersonaModule {}