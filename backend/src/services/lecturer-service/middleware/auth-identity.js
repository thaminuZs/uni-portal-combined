export const requireGatewayIdentity = (req, res, next) => {
  const userId = req.header("x-user-id");
  const email = req.header("x-user-email");
  const role = req.header("x-user-role");

  if (!userId || !email || !role) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  req.user = { id: userId, email, role };
  next();
};
