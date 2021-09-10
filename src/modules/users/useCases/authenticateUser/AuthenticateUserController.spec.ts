import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to authenticate an user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Adriano Klein",
      email: "email@email.com",
      password: "123456",
    });

    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email: "email@email.com",
      password: "123456",
    });
    expect(authenticatedUser.status).toBe(200);
  });

  it("Should not be able to authenticate an user with an incorrect email address", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Adriano Klein",
      email: "email@email.com",
      password: "123456",
    });

    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email: "email@email.com.br",
      password: "123456",
    });

    expect(authenticatedUser.status).toBe(401);
  });

  it("Should not be able to authenticate an user with an incorrect password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Adriano Klein",
      email: "email@email.com",
      password: "123456",
    });

    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email: "email@email.com",
      password: "incorrect_password",
    });

    expect(authenticatedUser.status).toBe(401);
  });
});
