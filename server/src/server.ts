import {
  authenticate,
  client,
  createBusiness,
  createMember,
  createTables,
  fetchBusinesses,
  fetchMembers,
  findMemberWithToken,
} from "./db";
import express from "express";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());

// Middleware to check if user is logged in
const isLoggedIn = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    if (!req.headers.authorization) {
      throw new Error("not authorized");
    }
    req.body.member = await findMemberWithToken(req.headers.authorization);
    next!();
  } catch (ex) {
    next!(ex);
  }
};

// GET Routes for members and businesses
app.get("/api/members", async (req, res, next) => {
  try {
    res.send(await fetchMembers());
  } catch (error) {
    next(error);
  }
});
app.get("/api/businesses", async (req, res, next) => {
  try {
    res.send(await fetchBusinesses());
  } catch (error) {
    next(error);
  }
});

// POST Route to Login and Register
app.post("/api/auth/login", async (req, res, next) => {
  try {
    res.send(await authenticate(req.body));
  } catch (error) {
    next(error);
  }
});
app.get("/api/auth/me", isLoggedIn, (req, res, next) => {
  try {
    res.send(req.body.member);
  } catch (error) {
    next(error);
  }
});
// Error Handling
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void => {
    res.status(500).send(err.message || "Something went wrong");
  }
);

const init = async () => {
  const port = process.env.PORT || 3000;
  await client.connect();
  console.log("Database connected successfully");

  await createTables();
  console.log("Tables created successfully");

  await Promise.all([
    createMember({
      id: uuidv4(),
      username: "moe",
      password: "moe123",
    }),
    createMember({
      id: uuidv4(),
      username: "lucy",
      password: "lucy123",
    }),
    createMember({
      id: uuidv4(),
      username: "ethyl",
      password: "ethyl123",
    }),
    createMember({
      id: uuidv4(),
      username: "curly",
      password: "curly123",
    }),
  ]);
  const [moe, lucy, ethyl, curly] = await fetchMembers();

  console.log(moe, lucy, ethyl, curly);
  console.log("Members created and fetched successfully");

  await Promise.all([
    createBusiness({
      id: uuidv4(),
      name: "Apple",
      description: "Apple is a technology company",
      city: "San Francisco",
    }),
    createBusiness({
      id: uuidv4(),
      name: "Samsung",
      description: "Samsung is a technology company",
      city: "Seoul",
    }),
    createBusiness({
      id: uuidv4(),
      name: "Google",
      description: "Google is a technology company",
      city: "Mountain View",
    }),
    createBusiness({
      id: uuidv4(),
      name: "Facebook",
      description: "Facebook is a technology company",
      city: "Menlo Park",
    }),
    createBusiness({
      id: uuidv4(),
      name: "Tesla",
      description: "Tesla is a technology company",
      city: "Palo Alto",
    }),
  ]);
  const [Apple, Samsung, Google, Facebook, Tesla] = await fetchBusinesses();

  console.log(Apple, Samsung, Google, Facebook, Tesla);
  console.log("Businesses created and fetched successfully");

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};

init();