import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should not be able to create a withdraw without funds", async () => {
    // criar o usuário
    await request(app).post("/api/v1/users").send({
      name: "Adriano Klein",
      email: "email@email.com",
      password: "123456",
    });
    // autenticar o usuário
    const response = await request(app).post("/api/v1/sessions").send({
      email: "email@email.com",
      password: "123456",
    });

    // obter o token do usuário
    const { token } = response.body;

    // realizar o depósito
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100.0,
        description: "This is just a test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    // fazer um saque
    const withdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 170.0,
        description: "This is just a test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });
    expect(withdraw.status).toBe(400);
  });

  it("Should not be able to create a statement by an unauthorized user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Adriano Klein",
      email: "email@email.com",
      password: "123456",
    });

    await request(app).post("/api/v1/sessions").send({
      email: "email@email.com",
      password: "123456",
    });

    const token = "InvalidToken";
    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 120.0,
        description: "New deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });
    expect(deposit.status).toBe(401);
  });

  it("Should be able to create a withdraw", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Adriano Klein",
      email: "email@email.com.br",
      password: "123456",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "email@email.com.br",
      password: "123456",
    });

    const { token } = response.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 750.0,
        description: "just a single deposit",
      })
      .set({ Authorization: `Bearer: ${token}` });

    const withdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 150.0,
        description: "Just a single withdraw",
      })
      .set({
        Authorization: `Bearer: ${token}`,
      });
    expect(withdraw.status).toBe(201);
  });

  it("Should be able to create a deposit", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Adriano Klein",
      email: "email@email.com",
      password: "123456",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "email@email.com",
      password: "123456",
    });

    const { token } = response.body;

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 150.0,
        description: "Making a new deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });
    expect(deposit.status).toBe(201);
  });
});
