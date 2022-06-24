import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { UsuarioController } from "../usuario/usuario.controller";
import * as request from 'supertest';
import { LocalMockAuthGuard } from "src/auth/guards/local-mock-emp-auth.guard";
import { AppModule } from "src/app.module";
import { Ticket } from "src/ticket/ticket.entity";

describe.skip('Tickets', () => {
    let app: INestApplication;

    let initialLength = 1;

    let id_ticket;
    let id_pedido = "624d49e60eb3e0a3bc28574e";
    let t_detalle;

    //cambiar
    const body = {
        ticket:{
            t_detalle:"Ticket de prueba",
            t_total:11,
            t_abono:5,
            t_tipo_equipo:"COMPUTADOR",
            t_num:null
        },
        id_pedido: id_pedido
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


    it(`/GET buscarTickets por PEDIDO`, async () => {
      const response = await request(app.getHttpServer())
        .get('/ticket/all/624d49e60eb3e0a3bc28574e')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
      expect(response.status).toBe(200);
      expect(response.body.results.tickets).toHaveLength(initialLength);
    });

    it(`/GET buscarTickets por PEDIDO invalido`, async () => {
        const response = await request(app.getHttpServer())
          .get('/ticket/all/424d49e60eb3e0abc28574e')
          .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        expect(response.status).toBe(400);
        expect(response.text).toBe("Pedido inválido");
      });

    it(`/GET buscarTickets por PEDIDO vacio`, async () => {
    const response = await request(app.getHttpServer())
        .get('/ticket/all/626a501667a2b515b62cf4e4')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
    expect(response.status).toBe(200);
    expect(response.body.results.tickets).toHaveLength(0);
    });

    it(`/POST crear Ticket OK`, async () => {
      const response = await request(app.getHttpServer())
        .post('/ticket/crear')
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        .set('Content-Type','application/json')
        .send(body)
      expect(response.status).toBe(201);
      expect(response.body.ticketCreado._id).toBeTruthy();
      id_ticket=response.body.ticketCreado._id;
      body.ticket.t_num=response.body.ticketCreado.t_num;
    });

    it.skip(`/POST crear Ticket sin campo obligatorio`, async () => {
        let json = body;
        t_detalle = json.ticket.t_detalle;
        delete json.ticket.t_detalle;
        const response = await request(app.getHttpServer())
          .post('/ticket/crear')
          .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
          .set('Content-Type','application/json')
          .send(json)
        expect(response.status).toBe(400);
        expect(response.text).toBe("Error al registrar ticket con los datos proporcionados");

        //Recuperar campo eliminado
        body.ticket.t_detalle = t_detalle;
    });

    it.skip(`/POST crear Ticket con Pedido invalido`, async () => {
        let json = body;
        json.id_pedido="424d49e60eb3e0abc28574e";
        const response = await request(app.getHttpServer())
            .post('/ticket/crear')
            .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
            .set('Content-Type','application/json')
            .send(json)
        expect(response.status).toBe(400);
        expect(response.text).toBe("Pedido inválido");

        //Regresar a body original
        json.id_pedido = id_pedido;
    });
 
    it(`/PATCH Actualizar Ticket`, async () => {
      let ticketActualizado = body;
      ticketActualizado.ticket.t_detalle = "Test probando detalle";
        
      console.log(ticketActualizado);
      const response = await request(app.getHttpServer())
        .patch('/ticket/update/'+id_ticket)
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        .set('Content-Type','application/json')
        .send(ticketActualizado)
      expect(response.status).toBe(200);
      expect(response.body.ticket.t_detalle).toBe("Test probando detalle");
    });

    it(`/PATCH Actualizar Ticket NUMERO INVALIDO`, async () => {
        let ticketActualizado = body;
        ticketActualizado.ticket.t_abono = -10;
          
        console.log(ticketActualizado);
        const response = await request(app.getHttpServer())
          .patch('/ticket/update/'+id_ticket)
          .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
          .set('Content-Type','application/json')
          .send(ticketActualizado)
        expect(response.status).toBe(400);
        expect(response.text).toBe("Valores numericos invalidos");
      });

    afterAll(async () => {
      let response = await request(app.getHttpServer())
        .delete('/ticket/del/'+id_ticket)
        .set('Authorization', 'Bearer '+process.env.TOKEN_TEST)
        .set('Content-Type','application/json')
    
      await app.close();
    });
  });