import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let createUserUseCase: CreateUserUseCase;
let inMemoryUserRepository: InMemoryUsersRepository;

describe("Create an user", () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
  });

  it("Should be able to create a new user", async () => {
    const user: ICreateUserDTO = {
      name: "user test",
      email: "teste@email.com",
      password: "123456",
    };
    await createUserUseCase.execute(user);

    const createdUser = await inMemoryUserRepository.findByEmail(user.email);
    expect(createdUser).toHaveProperty("id");
  });
  it("Should not be able to create an user with the same email", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "user test",
        email: "teste@email.com",
        password: "123456",
      };

      await createUserUseCase.execute(user);
      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
