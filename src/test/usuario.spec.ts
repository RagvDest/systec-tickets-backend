import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import * as request from 'supertest';
import { LocalMockAuthGuard } from "src/auth/guards/local-mock-emp-auth.guard";
import { AppModule } from "src/app.module";


describe('Usuarios', () => {
    let app: INestApplication;

    let initialLength = 7;

    let id_usuario;

    const body = {
      persona:{
          p_nombres:'Test Teo',
          p_apellidos:'Apellido Test',
          p_cedula:'1713175071'
      },
      usuario:{
        u_mail:'ragvdr4develop@gmail.com',
        u_activo:true,
        u_hash:"",
        u_usuario:'Test',
        rol_id:'61e7dc27aed590273949963f'
      },
      rol:'61e7dc27aed590273949963f'
    };
  
    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideGuard(LocalMockAuthGuard).useValue(LocalMockAuthGuard)
        .compile();
  
      app = moduleRef.createNestApplication();
      await app.init();
    });


    it(`/GET buscarUsuarios sin filtro`, async () => {
      const response = await request(app.getHttpServer())
        .get('/users/all')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
      expect(response.body.results).toHaveLength(initialLength);
    });

    it(`/GET buscarUsuarios filtro username`, async () => {
      const response = await request(app.getHttpServer())
        .get('/users/all?input=titus&op=u&filtro=Username')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
      expect(response.body.results).toHaveLength(1);
    });

    it(`/GET buscarUsuarios filtro nombres`, async () => {
      const response = await request(app.getHttpServer())
        .get('/users/all?input=admin&op=p&filtro=Nombres')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
      expect(response.body.results).toHaveLength(1);
    });

    it(`/GET buscarUsuarios filtro cedula`, async () => {
      const response = await request(app.getHttpServer())
        .get('/users/all?input=1245132101&op=p&filtro=Cédula')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
      expect(response.body.results).toHaveLength(1);
    });

    it(`/POST Crear usuario CLIENTE`, async () => {

      const response = await request(app.getHttpServer())
        .post('/users/crear')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        .set('Content-Type','application/json')
        .send(body)
      expect(response.body.ok).toBeTruthy();
      expect(response.body.usuario.u_mail).toBe('ragvdr4develop@gmail.com');
      id_usuario = response.body.usuario._id;

    });

    it(`/POST ERROR Crear usuario CLIENTE sin Nombres`, async () => {
      let json = body;
      delete json.persona.p_nombres;
      const response = await request(app.getHttpServer())
        .post('/users/crear')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        .set('Content-Type','application/json')
        .send(json)
      expect(response.status).toBe(400)
      expect(response.text).toBe('Error al crear usuario con los datos proporcionados');
    });

    it(`/POST ERROR Crear usuario CLIENTE unique value`, async () => {
      let json = body;
      const response = await request(app.getHttpServer())
        .post('/users/crear')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        .set('Content-Type','application/json')
        .send(json)
      expect(response.status).toBe(400)
      expect(response.text).toBe('Usuario o Mail YA estan registrados');
    });

    it(`/PATCH Actualizar usuario CLIENTE`, async () => {
      let usuarioActualizado = body;
      usuarioActualizado.usuario.u_usuario = 'TestActualizado';
      usuarioActualizado.persona.p_nombres = 'Test Teos';

      const response = await request(app.getHttpServer())
        .patch('/users/update/'+id_usuario)
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        .set('Content-Type','application/json')
        .send(usuarioActualizado)
      expect(response.status).toBe(200);
      expect(response.body.usuario.u_usuario).toBe('testactualizado');
      expect(response.body.persona.p_nombres).toBe('test teos');
    });

    it(`/DELETE Eliminar usuario/persona CLIENTE`, async () => {

      const response = await request(app.getHttpServer())
        .delete('/users/delete?mail=ragvdr4develop@gmail.com')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        .set('Content-Type','application/json')
      expect(response.status).toBe(200);
      expect(response.body.eliminado).toBe('ragvdr4develop@gmail.com');

    });
    
  
    afterAll(async () => {
      await app.close();
    });
  });