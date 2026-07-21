import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

/**
 * Route protection middleware verifying JWT access.
 */
export const protect = async (req, res, next) => {
  let token;

  // Extract token from Bearer scheme
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing. Access denied.",
    });
  }

  try {
    // Decode and verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authorization token.",
      });
    }

    // Attach verified user profile state
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account associated with this session no longer exists.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware runtime error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server encountered verification error.",
    });
  }
};

/**
 * Role-Based Access Control authorization filter.
 * 
 * @param {Array<string>} roles - Roles permitted to query the route.
 */
export const allowedRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Session unauthorized.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Internal workstation role '${req.user.role}' is unauthorized to query this scope.`,
      });
    }

    next();
  };
};
