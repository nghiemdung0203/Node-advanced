const User = require("../../model/User");
const {
  signupService,
  signinService,
  updateUserInfoService,
} = require("../../service/userService");
const { connect, disconnect } = require("../test_set_up");

beforeAll(async () => {
  await connect();
});

afterAll(async () => {
  await disconnect();
});
describe("Sign up service", () => {
  it("should sign up a user", async () => {
    const mockRequest = {
      body: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "@Password123456",
      },
    };
    const result = await signupService(mockRequest);
    expect(result).toHaveProperty("name", "John Doe");
    expect(result).toHaveProperty("email", "john.doe@example.com");
    expect(result).toHaveProperty("token");
    expect(result).not.toHaveProperty("password");
    const savedUser = await User.findOne({ email: "john.doe@example.com" });
    expect(savedUser).toBeTruthy();
    expect(savedUser.name).toBe("John Doe");
  });

  it("should throw error when email already exists", async () => {
    const mockRequest = {
      body: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "@Password123456",
      },
    };

    // Use expect().rejects.toThrow() for testing thrown errors
    await expect(signupService(mockRequest)).rejects.toThrow(
      `E11000 duplicate key error collection: test.users index: email_1 dup key: { email: "${mockRequest.body.email}" }`
    );
  });

  it("should throw error with invalid data", async () => {
    const mockRequest = {
      body: {
        name: "John Doe",
        // Missing email
        password: "@Password123456",
      },
    };

    await expect(signupService(mockRequest)).rejects.toThrow(
      '"email" is required'
    );
  });
});

describe("Sign in service", () => {
  it("should successfully sign in existing user", async () => {
    const mockRequest = {
      body: {
        email: "john.doe@example.com",
        password: "@Password123456",
      },
    };
    const result = await signinService(mockRequest);

    expect(result).toHaveProperty("name", "John Doe");
    expect(result).toHaveProperty("email", "john.doe@example.com");
    expect(result).toHaveProperty("token");
    expect(result).not.toHaveProperty("password");
  });

  it("should throw error with incorrect password", async () => {
    const mockRequest = {
      body: {
        email: "john.doe@example.com",
        password: "@Wrongpassword123456",
      },
    };

    await expect(signinService(mockRequest)).rejects.toThrow(
      "Email or password is incorrect"
    );
  });

  it("should throw error with invalid password", async () => {
    const mockRequest = {
      body: {
        email: "john.doe@example.com",
        password: "wrongpassword123456",
      },
    };

    await expect(signinService(mockRequest)).rejects.toThrow(
      "Password must contain at least 8 characters, with at least one uppercase letter, one lowercase letter, one number, and one special character."
    );
  });

  it("should throw error when user doesn't exist", async () => {
    const mockRequest = {
      body: {
        email: "nonexistent@example.com",
        password: "@Wrongpassword123456",
      },
    };

    await expect(signinService(mockRequest)).rejects.toThrow("User not found");
  });
});

describe("Update user info service", () => {
  let userId;

  beforeAll(async () => {
    // Get the user ID for update tests
    const user = await User.findOne({ email: "john.doe@example.com" });
    userId = user._id;
  });

  it("should successfully update user information", async () => {
    const mockRequest = {
      user: { _id: userId },
      body: {
        name: "Updated Name",
        password: "@Newpassword123456",
      },
    };

    const result = await updateUserInfoService(mockRequest);

    expect(result).toHaveProperty("name", "Updated Name");
    expect(result).not.toHaveProperty("password");

    // Verify update in database
    const updatedUser = await User.findById(userId);
    expect(updatedUser.name).toBe("Updated Name");
  });

  it("should throw error with missing user ID", async () => {
    const mockRequest = {
      user: {},
      body: {
        name: "Updated Name",
        password: "newpassword123",
      },
    };

    await expect(updateUserInfoService(mockRequest)).rejects.toThrow(
      "Cannot read properties of undefined (reading 'toString')"
    );
  });

  it("should throw error with invalid update data", async () => {
    const mockRequest = {
      user: { _id: userId },
      body: {
        name: "", // Invalid empty name
        password: "newpassword123"
      }
    };

    await expect(updateUserInfoService(mockRequest)).rejects.toThrow();
  });
});
