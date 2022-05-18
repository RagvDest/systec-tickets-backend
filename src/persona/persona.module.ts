import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rol, RolSchema } from 'src/rol/rol.entity';
import { RolService } from 'src/rol/rol.service';
import { PersonaController } from './persona.controller';
import { Persona, PersonaSchema } from './persona.entity';
import { PersonaService } from './persona.service';

@Module({
    imports: [MongooseModule.forFeature([
        {name:Persona.name, schema:PersonaSchema},
        {name:Rol.name, schema:RolSchema}
    ])],
    controllers:[PersonaController],
    providers:[PersonaService,RolService],
    exports:[PersonaService]
})
export class PersonaModule {}