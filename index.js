const express = require("express");
const app = express();

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");

dotenv.config();

mongoose
  .connect(process.env.DB)
  .then(() => console.log("DB running succesfully"))
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());

app.use("/api", authRoute);
app.use("/api", userRoute);
app.use("/api", postRoute);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
module.exports = app;
