import { container, inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/OperationType";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateTransferError } from "./CreateTransferError";

interface ICreateTransfer {
  sender_id: string;
  destination_user_id: string;
  amount: number;
  description: string;
  type: OperationType;
}

@injectable()
export class CreateTransferUserCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    destination_user_id,
    amount,
    description,
    sender_id,
  }: ICreateTransfer): Promise<Statement> {
    const user = await this.usersRepository.findById(destination_user_id);
    const getBalance = container.resolve(GetBalanceUseCase);
    const createStatement = container.resolve(CreateStatementUseCase);

    if (!user) {
      throw new CreateTransferError.UserNotFound();
    }

    const balance = await getBalance.execute({ user_id: sender_id });

    if (balance.balance < amount) {
      throw new CreateTransferError.InsufficientFunds();
    }

    const transfer = await createStatement.execute({
      amount,
      description,
      type: "transfer" as OperationType,
      user_id: sender_id,
    });

    // identificar o usuário de destino e passar o valor pra ele
    await createStatement.execute({
      amount,
      description,
      type: "deposit" as OperationType,
      user_id: user.id as string,
    });

    return transfer;
  }
}
