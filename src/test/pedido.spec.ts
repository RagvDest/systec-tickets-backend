import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { UsuarioController } from "../usuario/usuario.controller";
import * as request from 'supertest';
import { LocalMockAuthGuard } from "src/auth/guards/local-mock-emp-auth.guard";
import { AppModule } from "src/app.module";


describe('Pedidos', () => {
    let app: INestApplication;

    let initialLength = 15;

    let id_pedido;
    let fc_registro = "2022-02-01T09:37:12.168Z";

    //cambiar
    const body = {
        pedido:{
          ped_fc_registro: fc_registro,
          ped_fc_fin:null,
          ped_estado:null,
          ped_nro_orden:null
      },
      id_usuario:"61f113a2b83244312b9ec796"
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


    it(`/POST buscarPedidos sin filtro`, async () => {
      const response = await request(app.getHttpServer())
        .post('/pedido/all')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
      expect(response.status).toBe(200);
      expect(response.body.results).toHaveLength(initialLength);
    });

    it(`/POST buscarPedidos filtro nombres`, async () => {
      const response = await request(app.getHttpServer())
        .post('/pedido/all?input=titus&filtro=Nombres')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
      expect(response.status).toBe(200);
      expect(response.body.results).toHaveLength(4);
    });

    it(`/POST buscarPedidos filtro cedula`, async () => {
      const response = await request(app.getHttpServer())
        .post('/pedido/all?input=1305412321&filtro=Cédula')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
      expect(response.status).toBe(200);
      expect(response.body.results).toHaveLength(4);
    });

    it(`/POST buscarPedidos filtro caso no hay`, async () => {
      const response = await request(app.getHttpServer())
        .post('/pedido/all?input=13021&filtro=Cédula')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
      expect(response.status).toBe(200);
      expect(response.body.results).toHaveLength(0);
    });
    
    it(`/POST Crear Pedido`, async () => {

      const response = await request(app.getHttpServer())
        .post('/pedido/crear')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        .set('Content-Type','application/json')
        .send(body)
      expect(response.status).toBe(201);
      expect(response.body.pedidoCreado.usuario_id._id).toBe('61f113a2b83244312b9ec796');
      expect(response.body.pedidoCreado.ped_nro_orden).toBeTruthy();
      id_pedido = response.body.pedidoCreado._id;
      body.pedido.ped_nro_orden = response.body.pedidoCreado.ped_nro_orden;
    });

    it(`/POST ERROR Crear Pedido sin campo`, async () => {
      let json = body;
      delete json.pedido.ped_fc_registro;
      const response = await request(app.getHttpServer())
        .post('/pedido/crear')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        .set('Content-Type','application/json')
        .send(json)
      expect(response.status).toBe(400)
      expect(response.text).toBe('Error al registrar pedido con esos datos');
    });
    

    it(`/PATCH Actualizar Pedido`, async () => {
      let pedidoActualizado = body;
      let fc_fin = new Date();
      pedidoActualizado.pedido.ped_fc_fin = fc_fin;
      pedidoActualizado.pedido.ped_estado = 'ABIERTO';
      pedidoActualizado.pedido.ped_fc_registro = fc_registro;

      const response = await request(app.getHttpServer())
        .patch('/pedido/update/'+id_pedido)
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        .set('Content-Type','application/json')
        .send(pedidoActualizado)
      expect(response.status).toBe(200);
      expect(response.body.pedido.ped_fc_fin).toBe(fc_fin.toISOString());
    });

    it(`/GET Conseguir trabajos pendientes (Pedidos Abiertos)`, async () =>{
      const response = await request(app.getHttpServer())
        .get('/pedido/tpendiente')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        .set('Content-Type','application/json')
      expect(response.status).toBe(200);
      expect(response.body).toBeTruthy();
    });

    afterAll(async () => {
      let response = await request(app.getHttpServer())
        .delete('/pedido/del/'+id_pedido)
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        .set('Content-Type','application/json')
      await app.close();
    });
  });