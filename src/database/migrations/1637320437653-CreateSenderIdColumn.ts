import { table } from "console";
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class CreateSenderIdColumn1637320437653 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "statements",
      new TableColumn({
        name: "sender_id",
        default: null,
        onUpdate: "CASCADE",
        isNullable: true,
        type: "varchar",
      })
    );
  }
  // table: Table | string, column: TableColumn

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("statements", "sender_id");
  }
}
