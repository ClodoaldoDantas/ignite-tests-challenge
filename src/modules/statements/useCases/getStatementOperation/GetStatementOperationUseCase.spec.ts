import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../createStatement/CreateStatementController";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";

const mockUser = {
  name: "test name",
  email: "test@test.com",
  password: "1234",
};

describe("Create Statement", () => {
  let createStatementUseCase: CreateStatementUseCase;
  let createUserUseCase: CreateUserUseCase;
  let getStatementOperationUseCase: GetStatementOperationUseCase;
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let inMemoryUsersRepository: InMemoryUsersRepository;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to get the transaction", async () => {
    const user = await createUserUseCase.execute(mockUser);
    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 400,
      description: "test statement",
      type: OperationType.DEPOSIT,
    });

    const result = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    });

    expect(result.id).toEqual(statement.id);
  });

  it("should not be able to get the transaction if user not exists", () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "incorrect-id",
        statement_id: "incorrect-statement",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get the transaction if statement not exists", () => {
    expect(async () => {
      const user = await createUserUseCase.execute(mockUser);

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "incorrect-statement",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
