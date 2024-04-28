import express, { urlencoded } from "express";
import jwt from "jsonwebtoken";
import expressLayouts from "express-ejs-layouts";
import dotenv from "dotenv";
dotenv.config();

// routes
import registerRoutes from "./routes/register.routes.js";
import loginRoutes from "./routes/login.routes.js";

const app = express();

app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/layout");

app.use(urlencoded({ extended: true }));

// Secret key for JWT
const secretKey = process.env.SECRET_KEY

app.use("/api", registerRoutes);
app.use("/api", loginRoutes);

app.get("/", (req, res) => {
  res.render("index");
});

// * protected dummy route
app.get("/protected", (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).send("Unauthorized");
  } else {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        res.status(401).send("Invalid token");
      } else {
        res.send(`Welcome, ${decoded.username}!`);
      }
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
