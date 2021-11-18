// eslint-disable-next-line max-classes-per-file
import { AppError } from "../../../../shared/errors/AppError";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CreateTransferError {
  export class UserNotFound extends AppError {
    constructor() {
      super("User not found");
    }
  }
  export class InsufficientFunds extends AppError {
    constructor() {
      super("Insufficient funds", 400);
    }
  }
}
