import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a user", async () => {
    const user = await request(app).post("/api/v1/users").send({
      name: "Adriano Klein",
      email: "email@email.com.br",
      password: "123456",
    });

    expect(user.status).toBe(201);
  });

  it("Should not be able to create a user with a existent email address", async () => {
    await request(app).post("/api/v1/user").send({
      name: "Adriano Klein",
      email: "email@email.com",
      password: "123456",
    });
    const user2 = await request(app).post("/api/v1/user").send({
      name: "Adriano Klein",
      email: "email@email.com",
      password: "123456",
    });
    expect(user2.status).toBe(404);
  });
});
