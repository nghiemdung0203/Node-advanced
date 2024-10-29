const mongoose = require("mongoose");
const authenticate = require("../../middleware/authenticate");
const { connect, disconnect } = require("../test_set_up");
const {
  createBlogService,
  getBlogListService,
  updateBlogService,
  deleteBlogService,
} = require("../../service/blogService");
const {
  createBlogController,
  getBlogListController,
  updateBlogController,
  deleteBlogController,
} = require("../../controller/blogController");
const authenticateAccessBlog = require("../../middleware/authenticateAccessBlog");

jest.mock("../../service/blogService.js");
jest.mock("../../middleware/authenticate.js");
jest.mock("../../middleware/authenticateAccessBlog.js");

let createdBlog;
let authorId;

beforeAll(async () => {
  await connect();
  authorId = new mongoose.Types.ObjectId();
  createdBlog = {
    _id: new mongoose.Types.ObjectId(),
    title: "Sample Blog",
    author: authorId,
    content: "This is a sample blog post",
    likes: 0,
    views: 0,
  };
});

afterAll(async () => {
  jest.clearAllMocks();
  await disconnect();
});

describe("Create blog controller", () => {
  const req = {
    headers: {
      authorization: "Bearer validToken",
    },
    body: {
      title: "Sample Blog",
      content: "This is a sample blog post",
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  it("should create a new blog", async () => {
    authenticate.mockImplementation((req, res, next) => {
      req.user = authorId;
      next();
    });
    const mockBlogResponse = createdBlog;
    await authenticate(req, res, jest.fn());
    await createBlogService.mockResolvedValue(mockBlogResponse);
    await createBlogController(req, res);
    expect(res.status).toBeCalledWith(201);
    expect(res.json).toBeCalledWith(mockBlogResponse);
  });

  it("should fail to create the blog and return 500 status", async () => {
    await createBlogService.mockRejectedValue(
      new Error("Failed to create blog")
    );
    await createBlogController(req, res);
    expect(res.status).toBeCalledWith(500);
    expect(res.json).toBeCalledWith("Failed to create blog");
  });
});

describe("Get blog list controller", () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  it("should successfully retrieve blog list and return status 200", async () => {
    const mockBlogList = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: "Blog 1",
        content: "Content 1",
        author: {
          _id: new mongoose.Types.ObjectId(),
          name: "Author 1",
        },
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: "Blog 2",
        content: "Content 2",
        author: {
          _id: new mongoose.Types.ObjectId(),
          name: "Author 2",
        },
      },
    ];

    const serviceResponse = {
      blogList: mockBlogList,
      page: 1,
      limit: 10,
      totalBlog: 15,
    };

    const expectedResponse = {
      blogList: mockBlogList,
      currentPage: 1,
      totalPages: 2,
    };

    const req = {
      query: {
        page: "1",
        limit: "10",
      },
    };

    getBlogListService.mockResolvedValue(serviceResponse);

    await getBlogListController(req, res);

    expect(getBlogListService).toHaveBeenCalledWith(req);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expectedResponse);
  });

  it("should handle service error and return status 500", async () => {
    const req = {
      query: {
        page: "1",
        limit: "10",
      },
    };

    const errorMessage = "Database error occurred";
    getBlogListService.mockRejectedValue(new Error(errorMessage));

    await getBlogListController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(errorMessage);
  });
});

describe("Update blog controller", () => {
  it("should update a blog and return status 200", async () => {
    // Ensure req is defined inside the test
    const req = {
      headers: {
        authorization: "Bearer validToken",
      },
      params: {
        blogId: createdBlog._id, // This should now be defined correctly
      },
      body: {
        title: "Updated Blog",
        content: "This is an updated blog post",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    authenticateAccessBlog.mockImplementation((req, res, next) => {
      req.user = authorId;
      next();
    });

    const mockUpdatedBlog = createdBlog; // This is still valid
    await authenticateAccessBlog(req, res, jest.fn());
    await updateBlogService.mockResolvedValue(mockUpdatedBlog);
    await updateBlogController(req, res);
    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(mockUpdatedBlog);
  });

  it("should handle service error and return status 500", async () => {
    const req = {
      headers: {
        authorization: "Bearer validToken",
      },
      params: {
        blogId: createdBlog._id, // This should now be defined correctly
      },
      body: {
        title: "Updated Blog",
        content: "This is an updated blog post",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const errorMessage = "Failed to update blog";
    authenticateAccessBlog.mockImplementation((req, res, next) => {
      req.user = authorId;
      next();
    });

    await authenticateAccessBlog(req, res, jest.fn());
    await updateBlogService.mockRejectedValue(new Error(errorMessage));
    await updateBlogController(req, res);
    expect(res.status).toBeCalledWith(500);
    expect(res.json).toBeCalledWith(errorMessage);
  });
});

describe("Delete blog controller", () => {
  it("should delete a blog and return status 200", async () => {
    const req = {
      headers: {
        authorization: "Bearer validToken",
      },
      params: {
        blogId: createdBlog._id, // Accessing createdBlog._id here should now be valid
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockDeletedBlog = "deleteBlog";
    authenticateAccessBlog.mockImplementation((req, res, next) => {
      req.user = authorId;
      next();
    });

    await authenticateAccessBlog(req, res, jest.fn());
    await deleteBlogService.mockResolvedValue(mockDeletedBlog);
    await deleteBlogController(req, res);
    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(mockDeletedBlog);
  });

  it("should handle service error and return status 500", async () => {
    const req = {
      headers: {
        authorization: "Bearer validToken",
      },
      params: {
        blogId: createdBlog._id, // Accessing createdBlog._id here should now be valid
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const errorMessage = "Failed to delete blog";
    authenticateAccessBlog.mockImplementation((req, res, next) => {
      req.user = authorId;
      next();
    });

    await authenticateAccessBlog(req, res, jest.fn());
    await deleteBlogService.mockRejectedValue(new Error(errorMessage));
    await deleteBlogController(req, res);
    expect(res.status).toBeCalledWith(500);
    expect(res.json).toBeCalledWith(errorMessage);
  });
});
