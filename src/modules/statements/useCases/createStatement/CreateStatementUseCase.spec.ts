import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/OperationType";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryUserRepository: InMemoryUsersRepository;
let createStatementsRepositoryInMemory: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
    createStatementsRepositoryInMemory = new InMemoryStatementsRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUserRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUserRepository,
      createStatementsRepositoryInMemory
    );
  });

  it("Should be able to create a new Statement", async () => {
    const user: ICreateUserDTO = {
      name: "Adriano Klein",
      email: "email@email.com",
      password: "1234567",
    };

    await createUserUseCase.execute(user);

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    const userId = authenticatedUser.user.id as string;

    const statement: ICreateStatementDTO = {
      user_id: userId,
      type: "deposit" as OperationType,
      amount: 12.4,
      description: "descricao",
    };

    const createdStatement: ICreateStatementDTO =
      await createStatementUseCase.execute(statement);

    expect(createdStatement.amount).toEqual(expect.any(Number));
    expect(createdStatement).toHaveProperty("id");
  });

  it("Should not be able to create a statement with a unauthenticated user", async () => {
    const newStatement: ICreateStatementDTO = {
      user_id: "invalid_user_id",
      amount: 100,
      type: "deposit" as OperationType,
      description: "descricao",
    };
    await expect(
      createStatementUseCase.execute(newStatement)
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to make a withdraw without a fund", async () => {
    const user: ICreateUserDTO = {
      name: "Adriano Klein",
      email: "email@email.com",
      password: "1234567",
    };

    await createUserUseCase.execute(user);

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    const userId = authenticatedUser.user.id as string;

    const withdraw: ICreateStatementDTO = {
      amount: 10000,
      description: "Buy a new car",
      type: "withdraw" as OperationType,
      user_id: userId,
    };

    await expect(
      createStatementUseCase.execute(withdraw)
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
