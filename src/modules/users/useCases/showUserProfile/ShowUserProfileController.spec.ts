import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Show User Profile controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to show a user profile", async () => {
    // criar um usuário
    await request(app).post("/api/v1/users").send({
      name: "Adriano Klein",
      email: "email@email.com",
      password: "123456",
    });
    // autenticar o usuário
    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email: "email@email.com",
      password: "123456",
    });
    // obter o token do usuário
    const { token } = authenticatedUser.body;

    // obter o perfil do usuário
    const userProfile = await request(app)
      .get("/api/v1/profile")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });
    expect(userProfile.body).toHaveProperty("id");
    expect(userProfile.body).toHaveProperty("name");
    expect(userProfile.body).toHaveProperty("email");
  });

  it("Should not be able to show a profile to a unauthenticated user", async () => {
    // criar um usuário
    await request(app).post("/api/v1/users").send({
      name: "Adriano Klein",
      email: "email@email.com",
      password: "123456",
    });
    // autenticar o usuário
    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email: "email@email.com",
      password: "1234567",
    });
    expect(authenticatedUser.status).toBe(401);
  });
});
