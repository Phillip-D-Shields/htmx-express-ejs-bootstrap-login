import { Router } from "express";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import db from "../db/database.cjs";

const secretKey = process.env.SECRET_KEY;

const router = Router();

// * login routes
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res) => {
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
        const isPasswordValid = await compare(password, user.password);
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

export default router;
