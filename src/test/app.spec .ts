import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { UsuarioController } from "../usuario/usuario.controller";
import * as request from 'supertest';
import { LocalMockAuthGuard } from "src/auth/guards/local-mock-emp-auth.guard";
import { AppModule } from "src/app.module";


describe('Estado', () => {
    let app: INestApplication;

    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideGuard(LocalMockAuthGuard).useValue(LocalMockAuthGuard)
        .compile();
  
      app = moduleRef.createNestApplication();
      await app.init();
    });

    it(`/GET consultar Datos Dashboard`, async () => {
        const response = await request(app.getHttpServer())
          .get('/dashboard')
          .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        expect(response.status).toBe(200);
        expect(response.body.totalVentas).toBeTruthy();
        expect(response.body.txEquipos).toBeTruthy();
        expect(response.body.txEstados).toBeTruthy();
        expect(response.body.txClientes).toBeTruthy();
        expect(response.body.txActivos).toBeTruthy();
        expect(response.body.nUsers).toBeTruthy();
      });

    afterAll(async () => {
     
      await app.close();
    });
  });