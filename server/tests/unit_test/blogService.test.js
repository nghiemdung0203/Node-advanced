const User = require("../../model/User");
const {
  createBlogService,
  getBlogListService,
  updateBlogService,
  deleteBlogService,
} = require("../../service/blogService");
const { connect, disconnect } = require("../test_set_up");
const mongoose = require("mongoose");
beforeAll(async () => {
  await connect();
});

afterAll(async () => {
  await disconnect();
});
let user;
let createdBlog;
describe("Create Blog Service", () => {
  beforeAll(async () => {
    user = new User({
      name: "John Doe",
      email: "john@example.com",
      password: "@Password123456",
    });
    await user.save();
  });
  it("Should create a new blog", async () => {
    const newBlog = {
      user: { _id: user._id },
      body: { title: "Test Blog", content: "This is a test blog" },
    };
    const result = await createBlogService(newBlog);
    createdBlog = result;
    expect(result).toBeTruthy();
    expect(result.title).toBe("Test Blog");
    expect(result.content).toBe("This is a test blog");
  });

  it("Should fail to create a new blog due to missing user ID", async () => {
    const newBlog = {
      body: { title: "Test Blog", content: "This is a test blog" },
    };

    try {
      await createBlogService(newBlog);
    } catch (error) {
      expect(error.message).toBe(
        "Cannot read properties of undefined (reading '_id')"
      ); // Check for the specific error message
    }
  });

  it("should throw error when title is missing", async () => {
    const newBlog = {
      user: { _id: user._id },
      body: { content: "This is a test blog" },
    };

    try {
      await createBlogService(newBlog);
    } catch (error) {
      expect(error.message).toBe('"title" is required'); // Check for the specific error message
    }
  });
});

describe("Get Blog List Service", () => {
  it("Should retrieve blog list", async () => {
    const blogList = await createBlogService({
      user: { _id: user._id },
      body: { title: "Test Blog 1", content: "This is a test blog 1" },
    });
    const blogList2 = await createBlogService({
      user: { _id: user._id },
      body: { title: "Test Blog 2", content: "This is a test blog 2" },
    });
    const req = {
      query: {
        page: 1,
        limit: 10,
      },
    };
    const result = await getBlogListService(req);
    expect(result.blogList.length).toBe(3);
    expect(result.blogList[0].title).toBe("Test Blog");
    expect(result.blogList[1].title).toBe("Test Blog 1");
  });

  it("should throw error for negative page number", async () => {
    const req = {
      query: {
        page: -1,
        limit: 10,
      },
    };
    try {
      await getBlogListService(req);
    } catch (error) {
      expect(error.message).toBe("Page must be at least 1.");
    }
  });

  it("should throw error for negative limit", async () => {
    const req = {
      query: {
        page: 1,
        limit: -10,
      },
    };
    try {
      await getBlogListService(req);
    } catch (error) {
      expect(error.message).toBe("Limit must be at least 1.");
    }
  });
});

describe("Update blog service", () => {
  it("Should update blog service", async () => {
    const updatedBlog = {
      user: {
        _id: user._id,
      },
      query: {
        blogId: createdBlog._id.toString(),
      },
      body: {
        title: "Updated Test Blog",
        content: "This is an updated test blog",
      },
    };
    const resultUpdated = await updateBlogService(updatedBlog);
    expect(resultUpdated.title).toEqual("Updated Test Blog");
    expect(resultUpdated.content).toEqual("This is an updated test blog");
  });
  it("Should throw error when blog ID is missing", async () => {
    const updatedBlog = {
      user: {
        _id: user._id,
      },
      body: {
        title: "Updated Test Blog",
        content: "This is an updated test blog",
      },
    };
    try {
      await updateBlogService(updatedBlog);
    } catch (error) {
      expect(error.message).toBe(
        "Cannot read properties of undefined (reading 'blogId')"
      );
    }
  });
  it("Should throw error when user ID does not match the blog author", async () => {
    const updatedBlog = {
      user: {
        _id: new mongoose.Types.ObjectId(),
      },
      query: {
        blogId: createdBlog._id.toString(),
      },
      body: {
        title: "Updated Test Blog",
        content: "This is an updated test blog",
      },
    };
    try {
      await updateBlogService(updatedBlog);
    } catch (error) {
      expect(error.message).toBe("Unauthorized");
    }
  });
});

describe("Delete blog service", () => {
  it("Should delete blog service", async() => {
    const deletedBlog = {
      user: {
        _id: user._id,
      },
      query: {
        blogId: createdBlog._id.toString(),
      },
    };
    const result = await deleteBlogService(deletedBlog);
    expect(result).toBeTruthy();
  });
  it("Should throw error when blog ID is missing", async () => {
    const deletedBlog = {
      user: {
        _id: user._id,
      },
    };
    try {
      await deleteBlogService(deletedBlog);
    } catch (error) {
      expect(error.message).toBe(
        "Cannot read properties of undefined (reading 'blogId')"
      );
    }
  })
  it("Should throw error when user ID does not match the blog author", async () => {
    const deletedBlog = {
      user: {
        _id: new mongoose.Types.ObjectId(),
      },
      query: {
        blogId: createdBlog._id.toString(),
      },
    };
    try {
      await deleteBlogService(deletedBlog);
    } catch (error) {
      expect(error.message).toBe("Unauthorized");
    }
  })
});
