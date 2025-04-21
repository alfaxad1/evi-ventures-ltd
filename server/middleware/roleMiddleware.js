import jwt from "jsonwebtoken";

export const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!allowedRoles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ error: "Access denied. Insufficient permissions." });
      }
      req.user = decoded; // Attach user info to the request
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token." });
    }
  };
};
