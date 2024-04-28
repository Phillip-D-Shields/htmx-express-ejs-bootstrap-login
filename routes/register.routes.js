import { Router } from "express";
import { hash } from "bcrypt";

import db from "../db/database.cjs";

const router = Router();

// * register routes
router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await hash(password, 10);

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else {
        res.send(
          '<div class="alert alert-success" role="alert">Registration successful. <a href="/api/login">Login</a></div>'
        );
      }
    }
  );
});

export default router;
