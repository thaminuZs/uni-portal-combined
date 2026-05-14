export const allowRoles =
  (...allowed) =>
  (req, res, next) => {
    const role = req.user?.role;
    if (!role) {
      return res.status(401).json({ success: false, message: "unauthorized" });
    }
    if (!allowed.includes(role)) {
      return res.status(403).json({ success: false, message: "forbidden" });
    }
    next();
  };
