import "reflect-metadata";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/OperationType";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get a balance", () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUserRepository
    );
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUserRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUserRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to list a balance", async () => {
    const user: ICreateUserDTO = {
      email: "email@email.com",
      name: "Nome teste",
      password: "123456",
    };

    await createUserUseCase.execute(user);
    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });
    const user_id = authenticatedUser.user.id as string;

    const deposit: ICreateStatementDTO = {
      user_id: user_id as string,
      type: "deposit" as OperationType,
      amount: 300000,
      description: "new car",
    };

    const withdraw = {
      user_id: user_id as string,
      type: "withdraw" as OperationType,
      amount: 100000,
      description: "new car",
    };

    // deposit
    await createStatementUseCase.execute(deposit);

    // withdraw
    await createStatementUseCase.execute(withdraw);

    // getbalance
    const balance = await getBalanceUseCase.execute({ user_id });

    expect(balance).toHaveProperty("statement");
    expect(balance.statement[0]).toHaveProperty("id");
    expect(balance.statement[0]).toHaveProperty("user_id");
    expect(balance.statement[0].type).toEqual(expect.any(String));
    expect(balance.statement[0].amount).toEqual(expect.any(Number));
    expect(balance.statement[0]).toHaveProperty("description");
  });

  it("should not be able to get a balance with an unauthenticated user", async () => {
    await expect(
      getBalanceUseCase.execute({ user_id: "invalid_user_id" })
    ).rejects.toBeInstanceOf(GetBalanceError);
  });
});
