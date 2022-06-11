import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../createStatement/CreateStatementController";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { GetBalanceError } from "./GetBalanceError";

const mockUser = {
  name: "test name",
  email: "test@test.com",
  password: "1234",
};

describe("Create Statement", () => {
  let createStatementUseCase: CreateStatementUseCase;
  let createUserUseCase: CreateUserUseCase;
  let getBalanceUseCase: GetBalanceUseCase;
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
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should not be able to get the balance if user not exists", () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "incorrect-id" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });

  it("should be able to get the balance", async () => {
    const user = await createUserUseCase.execute(mockUser);

    await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 400,
      description: "test deposit",
      type: OperationType.DEPOSIT,
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 100,
      description: "test withdraw",
      type: OperationType.WITHDRAW,
    });

    const result = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(result).toHaveProperty("statement");
    expect(result).toHaveProperty("balance");
    expect(result.balance).toEqual(300);
    expect(result.statement).toHaveLength(2);
  });
});
