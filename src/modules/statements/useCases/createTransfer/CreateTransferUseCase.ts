import { container, inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/OperationType";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
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
    const receiver = await this.usersRepository.findById(destination_user_id);
    const createStatement = container.resolve(CreateStatementUseCase);

    if (!receiver) {
      throw new CreateTransferError.UserNotFound();
    }

    const transfer = await createStatement.execute({
      amount,
      description,
      sender_id,
      type: "transfer" as OperationType,
      user_id: sender_id,
    });

    // identificar o usuário de destino e passar o valor pra ele
    await createStatement.execute({
      amount,
      description,
      type: "transfer" as OperationType,
      user_id: receiver.id as string,
      sender_id,
    });

    return transfer;
  }
}
