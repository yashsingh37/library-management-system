const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message: "You don't have permission to access this resource.",
        });
    }
    next();
  };
};

export default authorizeRole;
