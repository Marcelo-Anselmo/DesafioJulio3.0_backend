const { User } = require("../users/schema/User");

const authRouter = Router();
const authService = new AuthService();

authRouter.get("/", async (req, res) => {
  if (!req.query || !req.query?.email || !req.query?.password) {
    return res.status(500).send({ message: "erro no servidor" });
  }

  const isAuth = await authService.authUser(
    req.query.email,
    req.query.password
  );
  console.log("IsAuth", isAuth);

  if (isAuth !== true) {
    return res
      .status(401)
      .send({ auth: false, message: "verifique as credenciais" });
  }

  return res.status(200).send({ auth: true });
});

module.exports = { authRouter };