import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get Statement Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get a statement using a statement id", async () => {
    // Criar usuário
    await request(app).post("/api/v1/users").send({
      name: "Adriano Klein",
      email: "email@email.com",
      password: "123456",
    });
    // autenticar o usuário
    const authenticateUser = await request(app).post("/api/v1/sessions").send({
      email: "email@email.com",
      password: "123456",
    });
    // obter o token
    const { token } = authenticateUser.body;
    const { id: userId } = authenticateUser.body.user;

    // criar um statement
    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "To buy a new car",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    // obter o id do statement
    const { id } = deposit.body;

    // Tentar obter uma operação com o token errado
    const getStatement = await request(app)
      .get(`/api/v1/statements/${id}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    // esperar um retorno 201
    expect(getStatement.status).toBe(200);
    expect(getStatement.body).toHaveProperty("id");
  });

  it("Should be able to get a statement", async () => {
    // Criar o usuário
    await request(app).post("/api/v1/users").send({
      name: "Adriano Klein",
      email: "email@email.com",
      password: "123456",
    });

    // Autenticar o usuário
    const authenticateUser = await request(app).post("/api/v1/sessions").send({
      email: "email@email.com",
      password: "123456",
    });

    // Pegar o token
    const { token } = authenticateUser.body;

    // criar uma statement e retornar 201
    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 150.0,
        description: "New deposit for a new car",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });
    expect(deposit.status).toBe(201);
  });

  it("Should not be able to get a statement by an unauthenticated user", async () => {
    // Criar o usuário
    await request(app).post("/api/v1/users").send({
      name: "Adriano Klein",
      email: "email@email.com",
      password: "123456",
    });

    // Autenticar o usuário
    await request(app).post("/api/v1/sessions").send({
      email: "email@email.com",
      password: "123456",
    });

    // Pegar o token incorreto
    const token = "Invalid_token";

    // criar um statement
    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 150.0,
        description: "New deposit for a new car",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    // Tentar obter o statement
    const getStatement = await request(app)
      .get(`/api/v1/statements/:statement_id`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(getStatement.status).toBe(401);
  });
});
