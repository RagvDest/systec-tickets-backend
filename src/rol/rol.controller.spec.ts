import { Test, TestingModule } from "@nestjs/testing";
import { RolController } from "./rol.controller";
import { RolService } from "./rol.service";
import { Rol, RolSchema } from "./rol.entity";
import { Mongoose } from "mongoose";
import { getModelToken, MongooseModule } from "@nestjs/mongoose";
import { RolModule } from "./rol.module";

describe('RolController', () => {
    let rolController: RolController;

    const mockRepository = {
        crearRol() {
          return {};
        }
      };
  
    beforeEach(async () => {
      const rol: TestingModule = await Test.createTestingModule({
        imports:[RolModule]
      })
      .overrideProvider(getModelToken('Rol'))
      .useValue(mockRepository)
      .compile();
  
      rolController = rol.get<RolController>(RolController);
    });
  
    describe('Rol', () => {
      it('Crear ROL', async () => {
          const rol:Rol = {
            r_rol:'Empleado'
          };
        expect(await rolController.crearRol(rol)).toEqual({
            _id:expect.any(String),
            r_rol:'Empleado',
            __v:expect.any(Number)
        });
      });
    });
  });
  