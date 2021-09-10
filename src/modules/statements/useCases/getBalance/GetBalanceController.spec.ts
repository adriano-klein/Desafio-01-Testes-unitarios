import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get balance controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get statements", async () => {
    // criar usuário
    await request(app).post("/api/v1/users").send({
      name: "Adriano Klein",
      email: "email@email.com",
      password: "123456",
    });

    // Autenticar usuário
    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email: "email@email.com",
      password: "123456",
    });
    // pegar o jwt
    const { token } = authenticatedUser.body;

    // listar as operações
    const getBalance = await request(app)
      .get("/api/v1/statements/balance")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(getBalance.status).toBe(200);
  });

  it("Should not be able to get a balance by unauthenticated user", async () => {
    // Criar o usuário
    await request(app).post("/api/v1/users").send({
      name: "Adriano Klein",
      email: "email@email.com",
      password: "123456",
    });
    // Autenticar o usuário criado
    await request(app).post("/api/v1/sessions").send({
      email: "email@email.com",
      password: "123456",
    });

    // Criar um depósito
    await request(app).post("/api/v1/statements/deposit").send({
      amount: 150.0,
      description: "New deposit",
    });

    // Criar um saque
    await request(app).post("/api/v1/statements/withdraw").send({
      amount: 130.0,
      description: "New withdraw",
    });

    // Obter o balance
    const token = "Invalid token";
    const getBalance = await request(app)
      .post("/api/v1/statements/balance")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(getBalance.status).toBe(401);
  });
});
