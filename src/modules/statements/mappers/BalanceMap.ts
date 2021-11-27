import { Statement } from "../entities/Statement";

export class BalanceMap {
  static toDTO({
    statement,
    balance,
  }: {
    statement: Statement[];
    balance: number;
  }) {
    const parsedStatement = statement.map(
      ({
        id,
        user_id,
        sender_id,
        amount,
        description,
        type,
        created_at,
        updated_at,
      }) => {
        if (type === "transfer" && user_id !== sender_id) {
          return {
            id,
            sender_id,
            amount: Number(amount),
            description,
            type,
            created_at,
            updated_at,
          };
        }
        console.log({ id, user_id, sender_id });

        return {
          id,
          amount: Number(amount),
          description,
          type,
          created_at,
          updated_at,
        };
      }
    );

    return {
      statement: parsedStatement,
      balance: Number(balance),
    };
  }
}
