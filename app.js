const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const user = require("./routers/auth");
const connect = require("./db/connect");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

// middleware
app.use(express.json());
app.use(cors());
app.use("/api/v1", user);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT;

// start connection to database
const start = async () => {
  try {
    await connect(process.env.MONGO_URI);
    app.listen(port, console.log(`server is running on port: ${port}`));
  } catch (err) {
    console.log(err);
  }
};

start();
