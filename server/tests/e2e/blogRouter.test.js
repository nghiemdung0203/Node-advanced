const { connect, disconnect } = require("../test_set_up");
const express = require("express");
const mongoose = require("mongoose");
const request = require("supertest");
const blogRouter = require("../../router/blogRouter");
const jwt = require("jsonwebtoken");
const User = require("../../model/User");
const app = express();
app.use(express.json());
app.use("/api", blogRouter);
let token;
beforeAll(async () => {
  await connect();

  let testUser;
  let testBlog;

  // Create a user and obtain a token for authentication

  testUser = new User({
    name: "testuser",
    email: "test@example.com",
    password: "@Testpassword123456",
  });
  await testUser.save();
  token = testUser.generateToken();
});

afterAll(async () => {
  await disconnect();
});

describe("Create blog api", () => {
  it("should create a new blog", async () => {
    const newBlog = {
      title: "Test Blog",
      content: "This is a test blog.",
    };
    const response = await request(app)
      .post("/api/createBlog")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(201);
    testBlog = response.body;
    expect(response.body).toHaveProperty("_id");
    expect(response.body.title).toBe(newBlog.title);
    expect(response.body).toHaveProperty("likes");
    expect(response.body).toHaveProperty("views");
    expect(response.body.author.name).toBe("testuser");
    expect(response.body.author.email).toBe("test@example.com");
  });
  it("should not create a blog without authentication", async () => {
    const newBlog = {
      title: "Test Blog",
      content: "This is a test blog.",
    };
    const response = await request(app)
      .post("/api/createBlog")
      .send(newBlog)
      .expect(401);
    expect(response.body).toHaveProperty(
      "error",
      "No token provided, authorization denied."
    );
  });
  it("should not create a blog with invalid token", async () => {
    const newBlog = {
      title: "Test Blog",
      content: "This is a test blog.",
    };
    const response = await request(app)
      .post("/api/createBlog")
      .set("Authorization", "Bearer invalidtoken")
      .send(newBlog)
      .expect(401);
    expect(response.body).toHaveProperty("error", "jwt malformed");
  });
  it("should not create a blog with missing title or content", async () => {
    const newBlog = {};
    const response = await request(app)
      .post("/api/createBlog")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(500);
    expect(response.body).toEqual('"title" is required');
  });
});

describe("Get blog list api", () => {
  it("Should return blog list api", async () => {
    const response = await request(app)
      .get("/api/getBlogList")
      .query({ page: 1, limit: 5 })
      .expect(200);
    expect(response.body).toHaveProperty("blogList");
    expect(response.body).toHaveProperty("currentPage");
    expect(response.body).toHaveProperty("totalPages");
  });
  it("Should return 500 if page or limit is not provided", async () => {
    const blogListReq = {
      query: {},
    };
    const response = await request(app)
      .get("/api/getBlogList")
      .send(blogListReq)
      .expect(500);
  });
  it("Should return 500 if page or limit is not a number", async () => {
    const response = await request(app)
      .get("/api/getBlogList")
      .query({ page: "abc", limit: "def" })
      .expect(500);

    expect(response.body).toEqual("Page must be a number.");
  });
  it("Should return 500 if page or limit is negative", async () => {
    const response = await request(app)
      .get("/api/getBlogList")
      .query({ page: -1, limit: 10 })
      .expect(500);
    expect(response.body).toEqual("Page must be at least 1.");
  });
});

describe("Update blog api", () => {
  it("Should update blog api and return 201", async () => {
    const updatedBlog = {
      title: "Updated Test Blog",
      content: "This is an updated test blog.",
    };
    const response = await request(app)
      .put("/api/updateBlog")
      .set("Authorization", `Bearer ${token}`)
      .query({ blogId: testBlog._id })
      .send(updatedBlog)
      .expect(200);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.title).toBe(updatedBlog.title);
  });
  it("Should return 401 if not authenticated", async () => {
    const updatedBlog = {
      title: "Updated Test Blog",
      content: "This is an updated test blog.",
    };
    const response = await request(app)
      .put("/api/updateBlog")
      .query({ blogId: testBlog._id })
      .send(updatedBlog)
      .expect(401);
    expect(response.body).toHaveProperty(
      "error",
      "No token provided, authorization denied."
    );
  });
  it("Should return 401 if invalid token is provided", async () => {
    const updatedBlog = {
      title: "Updated Test Blog",
      content: "This is an updated test blog.",
    };
    const response = await request(app)
      .put("/api/updateBlog")
      .set("Authorization", "Bearer invalidtoken")
      .query({ blogId: testBlog._id })
      .send(updatedBlog)
      .expect(401);
    expect(response.body).toHaveProperty("error", "jwt malformed");
  });
  it("Should return 401 if blog is not found", async () => {
    const updatedBlog = {
      title: "Updated Test Blog",
      content: "This is an updated test blog.",
    };
    const response = await request(app)
      .put("/api/updateBlog")
      .set("Authorization", `Bearer ${token}`)
      .query({ blogId: "invalid_id" })
      .send(updatedBlog)
      .expect(401);
    expect(response.body).toHaveProperty(
      "error",
      'Cast to ObjectId failed for value "{ _id: \'invalid_id\' }" (type Object) at path "_id" for model "Blog"'
    );
  });
});

describe("Delete blog api", () => {
  it("Should delete blog api and return 200", async () => {
    const response = await request(app)
      .delete("/api/deleteBlog")
      .set("Authorization", `Bearer ${token}`)
      .query({ blogId: testBlog._id })
      .expect(200);
    expect(response.body).toBe("Delete Blog");
  })
  it("Should return 401 if not authenticated", async () => {
    const response = await request(app)
     .delete("/api/deleteBlog")
     .query({ blogId: testBlog._id })
     .expect(401);
    expect(response.body).toHaveProperty(
      "error",
      "No token provided, authorization denied."
    );
  })
  it("Should return 401 if invalid token is provided", async () => {
    const response = await request(app)
     .delete("/api/deleteBlog")
     .set("Authorization", "Bearer invalidtoken")
     .query({ blogId: testBlog._id })
     .expect(401);
    expect(response.body).toHaveProperty("error", "jwt malformed");
  })
  it("Should return 401 if blog is not found", async () => {
    const response = await request(app)
     .delete("/api/deleteBlog")
     .set("Authorization", `Bearer ${token}`)
     .query({ blogId: "invalid_id" })
     .expect(401);
    expect(response.body).toHaveProperty(
      "error",
      'Cast to ObjectId failed for value "{ _id: \'invalid_id\' }" (type Object) at path "_id" for model "Blog"'
    );
  })
  it("Should return 404 if user is not the owner of the blog", async () => {
    const response = await request(app)
     .delete("/api/deleteBlog")
     .set("Authorization", `Bearer ${token}`)
     .query({ blogId: "60877b8856565b10e4d0363d" }) // not the owner of this blog
     .expect(404);
    expect(response.body).toHaveProperty(
      "error",
      "Blog not found."
    );
  })
});
