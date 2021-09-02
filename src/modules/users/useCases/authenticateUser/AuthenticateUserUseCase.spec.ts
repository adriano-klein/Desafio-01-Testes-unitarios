import "reflect-metadata";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate an user", () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUserRepository
    );
  });

  it("Should be able to authenticate an user", async () => {
    const user = {
      email: "email@email.com",
      name: "Nome teste",
      password: "123456",
    };

    await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(authenticatedUser).toHaveProperty("token");
  });
  it("Should not be able to login with a wrong password", async () => {
    const user = {
      email: "email@email.com",
      name: "Adriano Klein",
      password: "12345",
    };

    await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    await expect(
      authenticateUserUseCase.execute({
        email: user.email,
        password: "123456",
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to login with a wrong password", async () => {
    const user = {
      email: "email@email.com",
      name: "Adriano Klein",
      password: "12345",
    };

    await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    await expect(
      authenticateUserUseCase.execute({
        email: "incorrect@email.com.br",
        password: user.password,
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
