import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "./CreateStatementController";
import { CreateStatementError } from "./CreateStatementError";

const mockUser = {
  name: "test name",
  email: "test@test.com",
  password: "1234",
};

describe("Create Statement", () => {
  let createStatementUseCase: CreateStatementUseCase;
  let createUserUseCase: CreateUserUseCase;
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
  });

  it("should not be able to make a transaction if user not exists", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "incorrect-id",
        amount: 200,
        description: "test deposit",
        type: OperationType.DEPOSIT,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should be able to create a new deposit", async () => {
    const user = await createUserUseCase.execute(mockUser);

    const result = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 200,
      description: "test deposit",
      type: OperationType.DEPOSIT,
    });

    expect(result).toHaveProperty("id");
  });

  it("should be able to create a new withdraw", async () => {
    const user = await createUserUseCase.execute(mockUser);

    await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 400,
      description: "test deposit",
      type: OperationType.DEPOSIT,
    });

    const result = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 100,
      description: "test withdraw",
      type: OperationType.WITHDRAW,
    });

    expect(result).toHaveProperty("id");
  });

  it("should not be able to create a new withdraw if balance is insufficient", () => {
    expect(async () => {
      const user = await createUserUseCase.execute(mockUser);

      await createStatementUseCase.execute({
        user_id: user.id as string,
        amount: 50,
        description: "test deposit",
        type: OperationType.DEPOSIT,
      });

      await createStatementUseCase.execute({
        user_id: user.id as string,
        amount: 100,
        description: "test withdraw",
        type: OperationType.WITHDRAW,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
