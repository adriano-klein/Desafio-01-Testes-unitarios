import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/OperationType";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Get Statement Operation", () => {
  inMemoryStatementsRepository = new InMemoryStatementsRepository();
  inMemoryUsersRepository = new InMemoryUsersRepository();
  getStatementOperationUseCase = new GetStatementOperationUseCase(
    inMemoryUsersRepository,
    inMemoryStatementsRepository
  );
  createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  authenticateUserUseCase = new AuthenticateUserUseCase(
    inMemoryUsersRepository
  );
  createStatementUseCase = new CreateStatementUseCase(
    inMemoryUsersRepository,
    inMemoryStatementsRepository
  );

  it("Should be able to get a statement operation", async () => {
    const user: ICreateUserDTO = {
      name: "Adriano Klein",
      email: "email@email.com",
      password: "123456",
    };

    await createUserUseCase.execute(user);

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });
    const userId = authenticatedUser.user.id as string;

    const newDeposit: ICreateStatementDTO = {
      user_id: userId,
      description: "Some description",
      type: "deposit" as OperationType,
      amount: 10000,
    };
    const newOperation = await createStatementUseCase.execute(newDeposit);
    expect(newOperation).toHaveProperty("id");
  });

  it("Should not be able get a statement operation with an inexistent user", async () => {
    const user: ICreateUserDTO = {
      name: "User test",
      email: "test@email.com",
      password: "123456",
    };

    await createUserUseCase.execute(user);

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });
    const userId = authenticatedUser.user.id as string;

    const newDeposit: ICreateStatementDTO = {
      user_id: userId,
      description: "Some description",
      type: "deposit" as OperationType,
      amount: 10000,
    };
    const newOperation = await createStatementUseCase.execute(newDeposit);

    await expect(
      getStatementOperationUseCase.execute({
        statement_id: newOperation.id as string,
        user_id: "invalid ID",
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able get a statement operation with an incorrect statement id", async () => {
    const user: ICreateUserDTO = {
      name: "User test2",
      email: "test2@email.com",
      password: "123456",
    };

    await createUserUseCase.execute(user);

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });
    const userId = authenticatedUser.user.id as string;

    const newDeposit: ICreateStatementDTO = {
      user_id: userId,
      description: "Some description",
      type: "deposit" as OperationType,
      amount: 10000,
    };
    const newOperation = await createStatementUseCase.execute(newDeposit);
    await expect(
      getStatementOperationUseCase.execute({
        statement_id: "invalid_operation_id",
        user_id: newOperation.user_id,
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
