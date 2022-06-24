import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { UsuarioController } from "../usuario/usuario.controller";
import * as request from 'supertest';
import { LocalMockAuthGuard } from "src/auth/guards/local-mock-emp-auth.guard";
import { AppModule } from "src/app.module";


describe('Estado', () => {
    let app: INestApplication;

    let initialLength = 0;

    let id_estado;
    let id_ticket = "626a592ebc22487795f2023b";

    //cambiar
    const body = {
        estado:{
            e_nombre:"DIAGNÓSTICO",
            e_detalle:"Pantalla dañada",
            e_usuario:"Titus Alexander",
            user_id: "61e902d8996cc57b8dca918d"
        },
        id_ticket:id_ticket
    };

    const comen = {
        comentario:{
            c_detalle:"Mas comentarios",
            c_usuario:"TitusGV",
            user_id: "61e902d8996cc57b8dca918d"
        }
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

    it.skip(`/GET buscarEstados de Ticket vacio`, async () => {
        const response = await request(app.getHttpServer())
          .get('/estado/all/'+id_ticket)
          .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        expect(response.status).toBe(200);
        expect(response.body.estado).toHaveLength(0);
      });


    it(`/POST crearEstado OK`, async () => {
      const response = await request(app.getHttpServer())
        .post('/estado/crear')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        .send(body)
      expect(response.status).toBe(201);
      expect(response.body.estado).toBeTruthy();
      expect(response.body.estado.ticket_id._id).toBe(id_ticket);

      id_estado = response.body.estado._id;
    });

    it.skip(`/POST crearEstado sin campo requerido`, async () => {
        let json = body;
        let e_detalle = json.estado.e_detalle;
        delete json.estado.e_detalle;
        const response = await request(app.getHttpServer())
          .post('/estado/crear')
          .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
          .send(json)
        expect(response.status).toBe(400);
        expect(response.text).toBe("Errores en validación");
  
        body.estado.e_detalle = e_detalle;

      });

      it.skip(`/POST crearEstado con Ticket no existente`, async () => {
        let json = body;
        json.id_ticket = "426a592ebc22487795f2023b";
        const response = await request(app.getHttpServer())
          .post('/estado/crear')
          .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
          .send(json)
        expect(response.status).toBe(400);
        expect(response.text).toBe("Ticket no existe");
  
        body.id_ticket = id_ticket;

      });

      it.skip(`/GET buscarEstados de Ticket`, async () => {
        const response = await request(app.getHttpServer())
          .get('/estado/all/'+id_ticket)
          .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        expect(response.status).toBe(200);
        expect(response.body.estado).toHaveLength(1);
      });

      it.skip(`/GET buscarEstados de Ticket invalido`, async () => {
        const response = await request(app.getHttpServer())
          .get('/estado/all/426a592ebc22487795f2023b')
          .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        expect(response.status).toBe(200);
        expect(response.body.estado).toHaveLength(0);
        expect(response.body.ticket).toBeNull();
      });

      it(`/PATCH Aniadir comentario`, async () => {
  
        const response = await request(app.getHttpServer())
          .patch('/estado/update/'+id_estado)
          .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
          .set('Content-Type','application/json')
          .send(comen)
        expect(response.status).toBe(200);
        expect(response.body.estado.e_comentarios).toHaveLength(1);
      });

      it(`/PATCH Aniadir comentario sin Campo`, async () => {
        let coment = comen;
        let c_detalle = comen.comentario.c_detalle;
        delete coment.comentario.c_detalle;
        const response = await request(app.getHttpServer())
          .patch('/estado/update/'+id_estado)
          .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
          .set('Content-Type','application/json')
          .send(coment)
        expect(response.status).toBe(400);
        expect(response.text).toBe('Datos inválidos');
      });
/*
    
*/
    afterAll(async () => {
      let response = await request(app.getHttpServer())
        .delete('/estado/del/'+id_estado)
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        .set('Content-Type','application/json')

      await app.close();
    });
  });