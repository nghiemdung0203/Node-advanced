const express = require("express");
const mongoose = require("mongoose");
const request = require("supertest");
const userRouter = require("../../router/userRouter");
const { connect, disconnect } = require("../test_set_up");
const User = require("../../model/User");
const app = express();
app.use(express.json());
app.use("/api", userRouter);

beforeAll(async () => {
  await connect();
});

afterAll(async () => {
  await disconnect();
});
let createdUser;
describe("Sign up api", () => {
  it("Should sign up a user", async () => {
    const newUser = {
      name: "John Doe",
      email: "john@example.com",
      password: "@Password123456",
    };
    const response = await request(app)
      .post("/api/signup")
      .send(newUser)
      .expect(201);
    createdUser = response.body;
    expect(response.body).toBeDefined();
    expect(response.body.name).toBe(newUser.name);
    expect(response.body.email).toBe(newUser.email);
    expect(response.body.token).toBeDefined();
    const savedUser = await mongoose
      .model("User")
      .findOne({ email: newUser.email });
    expect(savedUser).toBeDefined();
    expect(savedUser.name).toBe(newUser.name);
  });
  it("Should return 500 if the email is already taken", async () => {
    const existingUser = {
      name: "John Doe",
      email: "john@example.com",
      password: "@Password123456",
    };
    await request(app).post("/api/signup").send(existingUser).expect(500);
  });
  it("Should return 500 if the password is too short", async () => {
    const newUser = {
      name: "John Doe",
      email: "john@example.com",
      password: "short",
    };
    const response = await request(app)
      .post("/api/signup")
      .send(newUser)
      .expect(500);
    expect(response.body).toBe(
      "Password must contain at least 8 characters, with at least one uppercase letter, one lowercase letter, one number, and one special character."
    );
  });
  it("Should return 500 if the password is missing", async () => {
    const newUser = {
      name: "John Doe",
      email: "john@example.com",
    };
    const response = await request(app)
      .post("/api/signup")
      .send(newUser)
      .expect(500);
    expect(response.body).toBe('"password" is required');
  });
});

describe("Sign in api", () => {
  it("Should sign in a user", async () => {
    const user = {
      email: "john@example.com",
      password: "@Password123456",
    };
    const response = await request(app)
      .post("/api/signin")
      .send(user)
      .expect(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("email");
  });
  it("Should return 401 if the password is wrong", async () => {
    const user = {
      email: "john@example.com",
      password: "wrong",
    };
    const response = await request(app)
      .post("/api/signin")
      .send(user)
      .expect(403);
    expect(response.body).toEqual(
      "Password must contain at least 8 characters, with at least one uppercase letter, one lowercase letter, one number, and one special character."
    );
  });
  it("Should return 401 if the email is not found", async () => {
    const user = {
      email: "notfound@example.com",
      password: "@Password123456",
    };
    const response = await request(app)
      .post("/api/signin")
      .send(user)
      .expect(403);
    expect(response.body).toBe("User not found");
  });
});

describe("Update user information api", () => {
  it("should update user information", async () => {
    const updateData = {
      name: "John Doe Updated",
      password: "@NewPassword123456",
    };

    const response = await request(app)
      .put("/api/updateUser")
      .set("Authorization", `Bearer ${createdUser.token}`)
      .send(updateData)
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.name).toBe(updateData.name);
    expect(response.body).not.toHaveProperty("password");

    // Verify database update
    const updatedUser = await User.findById(createdUser._id);
    expect(updatedUser.name).toBe(updateData.name);
  });

  it("should return 401 when no token is provided", async () => {
    const updateData = {
      name: "John Doe Updated",
      password: "@NewPassword123456",
    };

    const response = await request(app)
      .put("/api/updateUser")
      .send(updateData)
      .expect(401);

    expect(response.body.error).toBe(
      "No token provided, authorization denied."
    );
  });

  it("should return 401 when invalid token is provided", async () => {
    const updateData = {
      name: "John Doe Updated",
      password: "@NewPassword123456",
    };

    const response = await request(app)
      .put("/api/updateUser")
      .set("Authorization", "Bearer invalidtoken")
      .send(updateData)
      .expect(401);
  });

  it("should return 500 when invalid data is provided", async () => {
    const updateData = {
      name: "", // Empty name should fail validation
      password: "short", // Too short password should fail validation
    };

    const response = await request(app)
      .put("/api/updateUser")
      .set("Authorization", `Bearer ${createdUser.token}`)
      .send(updateData)
      .expect(500);

    expect(response.body).toBeDefined();
  });
});
