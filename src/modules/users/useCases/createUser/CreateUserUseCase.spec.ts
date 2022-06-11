import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

describe("Create User", () => {
  let createUserUseCase: CreateUserUseCase;
  let inMemoryUsersRepository: InMemoryUsersRepository;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "test name",
      email: "test@test.com",
      password: "1234",
    });

    expect(user).toHaveProperty("id");
  });

  it("should not be able create a new user with existing email", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "test name",
        email: "test@test.com",
        password: "1234",
      });

      await createUserUseCase.execute({
        name: "test name 2",
        email: "test@test.com",
        password: "12345",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
