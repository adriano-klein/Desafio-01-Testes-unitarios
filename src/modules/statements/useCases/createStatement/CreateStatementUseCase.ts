import { send } from "process";
import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "../createTransfer/CreateTransferError";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    user_id, // destino
    type,
    amount,
    description,
    sender_id,
  }: ICreateStatementDTO): Promise<Statement> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new CreateStatementError.UserNotFound();
    }

    if (type === "withdraw" || (type === "transfer" && user_id === sender_id)) {
      const { balance } = await this.statementsRepository.getUserBalance({
        user_id: sender_id,
      });

      if (balance < amount) {
        throw new CreateTransferError.InsufficientFunds();
      }
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      type,
      amount,
      description,
      sender_id,
    });

    return statementOperation;
  }
}
