import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PersonaController } from './persona.controller';
import { Persona, PersonaSchema } from './persona.entity';
import { PersonaService } from './persona.service';

@Module({
    imports: [MongooseModule.forFeature([{name:Persona.name, schema:PersonaSchema}])],
    controllers:[PersonaController],
    providers:[PersonaService],
    exports:[PersonaService]
})
export class PersonaModule {}