const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./router/userRouter");
const blogRouter = require("./router/blogRouter")
const cors = require("cors");
const helmet = require('helmet');

require("dotenv").config();

const PORT = process.env.PORT;

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(userRouter);
app.use(blogRouter);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(PORT, async () => {
  console.log(`server up on port ${PORT}`);
});
