const {
  signupController,
  signinController,
  updateUserController,
} = require("../../controller/userController");
const authenticate = require("../../middleware/authenticate");
const { signupService, signinService, updateUserInfoService } = require("../../service/userService");
const { connect, disconnect } = require("../test_set_up");
const mongoose = require("mongoose");

jest.mock("../../service/userService.js");
jest.mock("../../middleware/authenticate");

beforeAll(async () => {
  await connect();
});

afterAll(async () => {
  jest.clearAllMocks();
  await disconnect();
});
let signUpUser;
describe("Sign up controller", () => {
  it("should create a new user and return 201 status", async () => {
    const req = {
      body: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "@Password123456",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockUserResponse = {
      _id: new mongoose.Types.ObjectId(),
      name: "John Doe",
      email: "john.doe@example.com",
    };
    signUpUser = mockUserResponse;
    await signupService.mockResolvedValue(mockUserResponse);
    await signupController(req, res);
    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith(mockUserResponse);
    expect(signupService).toHaveBeenCalledWith(req);
  });
  it("should return 500 status on error", async () => {
    const req = {
      body: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "@Password123456",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await signupService.mockRejectedValue(new Error("Failed to create user"));
    await signupController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Failed to create user");
  });
});

describe("Sign in controller", () => {
  it("should return 200 status and a token on successful login", async () => {
    const req = {
      body: {
        email: "john.doe@example.com",
        password: "@Password123456",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockUserResponse = {
      _id: signUpUser._id,
      name: "John Doe",
      email: "john.doe@example.com",
    };
    await signinService.mockResolvedValue(mockUserResponse);
    await signinController(req, res);
    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith(mockUserResponse);
    expect(signinService).toHaveBeenCalledWith(req);
  });
  it("should return 403 status on failed login", async () => {
    const req = {
      body: {
        email: "john.doe@example.com",
        password: "wrong_password",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await signinService.mockRejectedValue(new Error("Invalid credentials"));
    await signinController(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith("Invalid credentials");
  });
});

describe("update user controller", () => {
  it("should update user and return updated user and 201 status", async () => {
    const req = {
      headers: {
        authorization: "Bearer test_token",
      },
      body: {
        name: "John Doe Updated",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockUpdatedUser = {
      _id: signUpUser._id,
      name: "John Doe Updated",
      email: "john.doe@example.com",
    };
    authenticate.mockImplementation((req, res, next) => {
      req.user = {
        _id: signUpUser._id,
      };
      next();
    });
    await authenticate(req, res, jest.fn());
    await updateUserInfoService.mockResolvedValue(mockUpdatedUser);
    await updateUserController(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
    expect(updateUserInfoService).toHaveBeenCalledWith(req);
    expect(authenticate).toHaveBeenCalledWith(req, res, expect.any(Function));

  });
});
