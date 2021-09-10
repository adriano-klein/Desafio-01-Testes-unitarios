import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateUserUseCase } from "./CreateUserUseCase";

export class CreateUserController {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async execute(request: Request, response: Response) {
    const { name, email, password } = request.body;

    const createUser = container.resolve(CreateUserUseCase);

    await createUser.execute({
      name,
      email,
      password,
    });

    return response.status(201).send();
  }
}
