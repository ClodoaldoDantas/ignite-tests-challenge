import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

const mockUser = {
  name: "test name",
  email: "test@test.com",
  password: "1234",
};

describe("Create User", () => {
  let showUserProfileUseCase: ShowUserProfileUseCase;
  let createUserUseCase: CreateUserUseCase;
  let inMemoryUsersRepository: InMemoryUsersRepository;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to show a user profile", async () => {
    const createUserResult = await createUserUseCase.execute(mockUser);
    const profile = await showUserProfileUseCase.execute(
      createUserResult?.id ?? ""
    );

    expect(profile).toEqual(
      expect.objectContaining({
        id: createUserResult.id,
        name: createUserResult.name,
        email: createUserResult.email,
      })
    );
  });

  it("should not be able to show a user profile if id not exists", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("incorrect-id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
