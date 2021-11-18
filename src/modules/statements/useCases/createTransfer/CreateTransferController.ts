import { Request, Response } from "express";
import { container } from "tsyringe";

import { OperationType } from "../../entities/OperationType";
import { CreateTransferUserCase } from "./CreateTransferUseCase";

export class CreateTransferController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { amount, description } = request.body;
    const { id: sender_id } = request.user;
    const { user_id: destination_user_id } = request.params;

    const splittedPath = request.originalUrl.split("/");
    const type = splittedPath[splittedPath.length - 1] as OperationType;

    const createTransfer = container.resolve(CreateTransferUserCase);

    const transfer = await createTransfer.execute({
      destination_user_id,
      description,
      amount,
      sender_id,
      type,
    });

    const { id, created_at, updated_at } = transfer;
    return response.status(200).json({
      id,
      sender_id,
      amount,
      description,
      type,
      created_at,
      updated_at,
    });
  }
}
