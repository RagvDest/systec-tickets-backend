import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { UsuarioController } from "../usuario/usuario.controller";
import * as request from 'supertest';
import { LocalMockAuthGuard } from "src/auth/guards/local-mock-emp-auth.guard";
import { AppModule } from "src/app.module";


describe('Notificacion', () => {
    let app: INestApplication;

    let initialLength = 2;
    let totalLength = 4;

    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideGuard(LocalMockAuthGuard).useValue(LocalMockAuthGuard)
        .compile();
  
      app = moduleRef.createNestApplication();
      await app.init();
    });

    it(`/GET consultar notificaciones`, async () => {
        const response = await request(app.getHttpServer())
          .get('/noti/all')
          .set('Authorization', 'Bearer '+process.env.TOKEN_TEST_CLI)
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(initialLength);
      });

      it(`/DELETE Eliminar notificaciones de Test`, async () =>{
        const response = await request(app.getHttpServer())
          .delete('/noti/deleteAll')
          .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        expect(response.body.deletedCount).toBe(totalLength);
      })

    afterAll(async () => {
      await app.close();
    });
  });