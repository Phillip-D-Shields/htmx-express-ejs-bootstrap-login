const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("./database");
const expressLayouts = require("express-ejs-layouts");

const app = express();

app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/layout");

app.use(express.urlencoded({ extended: true }));

// Secret key for JWT
const secretKey = "the-very-secret-key-of-001122334455";

app.get("/", (req, res) => {
  res.render("index");
});

// Register route
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else {
        res.send(
          '<div class="alert alert-success" role="alert">Registration successful. <a href="/login">Login</a></div>'
        );
      }
    }
  );
});

// Login route
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else if (!user) {
        res.send(
          '<div class="alert alert-danger" role="alert">Invalid username or password</div>'
        );
      } else {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
          const token = jwt.sign({ username: user.username }, secretKey);
          res.send(
            `<div class="alert alert-success" role="alert">Login successful. Token: ${token}</div>`
          );
        } else {
          res.send(
            '<div class="alert alert-danger" role="alert">Invalid username or password</div>'
          );
        }
      }
    }
  );
});

// Protected route
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
