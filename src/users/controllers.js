const { Router } = require("express");
const UserService = require("./service");
const userRouter = Router();
const userService = new UserService();

userRouter.get("/info", async (request, response) => {
  response.redirect(`${process.env.CLIENT_SIDE}`);
});

userRouter.get("/profile", authCheck, (request, response) => {
  return response.status(200).json({ user: true });
});

userRouter.get("/", adminCheck, async (request, response) => {
  const users = await userService.getUsers();
  response.status(200).json({ users });
});

userRouter.post("/", async (request, response) => {
  const userCreated = await userService.createUser(request.body);

  if (userCreated?.mongoError) {
    return response.status(400).json({ ...userCreated.mongoError });
  }

  if (userCreated) return response.status(201).json(userCreated);
});

userRouter.put("/:email", async (request, response) => {
  if (!request?.params.email) {
    return response.status(500).send({
      errorMessage: "Internal Server Error: reach out support",
      status: 500,
    });
  }

  const userUpdated = await userService.updateUser(
    request.params.email,
    request.body
  );

  if (userUpdated?.mongoError) {
    return response
      .status(userUpdated?.mongoError.status)
      .json({ ...userUpdated.mongoError });
  }

  if (userUpdated) {
    return response.status(200).json({
      data: { ...userUpdated },
      message: `User ${userUpdated.email} updated with success`,
      status: 200,
    });
  }
});

userRouter.delete("/:email", async (request, response) => {
  if (!request?.params.email) {
    return response.status(500).send({
      errorMessage: "Internal Server Error: reach out support",
      status: 500,
    });
  }

  const userDeleted = await userService.deleteUser(request.params.email);

  if (userDeleted?.mongoError) {
    return response
      .status(userDeleted?.mongoError.status)
      .json({ ...userDeleted.mongoError });
  }

  if (userDeleted) {
    return response.status(204).json();
  }
});

module.exports = { userRouter };