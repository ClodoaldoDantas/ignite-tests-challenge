import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

const mockUser = {
  name: "test name",
  email: "test@test.com",
  password: "1234",
};

describe("Create User", () => {
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to authenticate user", async () => {
    await createUserUseCase.execute(mockUser);

    const result = await authenticateUserUseCase.execute({
      email: mockUser.email,
      password: mockUser.password,
    });

    expect(result).toHaveProperty("user");
    expect(result).toHaveProperty("token");
  });

  it("should not be able to authenticate user with incorrect email", async () => {
    await createUserUseCase.execute(mockUser);

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "email@test.com",
        password: mockUser.password,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate user with incorrect password", async () => {
    await createUserUseCase.execute(mockUser);

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: mockUser.email,
        password: "password-incorrect",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
