import jwt from "jsonwebtoken";

// Secret verification (fallback to secure string in dev environment)
const JWT_SECRET = process.env.JWT_SECRET || "aurea_dental_crm_secret_key_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Issuance of JWT token encoding user details.
 * 
 * @param {Object} user - The user mongoose document profile object.
 * @returns {string} The signed JWT token string.
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
};

/**
 * Verification validation profile of encoded JWT.
 * 
 * @param {string} token - The raw bearer token string.
 * @returns {Object|null} The decoded token payload values or null.
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("JWT token verification failed:", error.message);
    return null;
  }
};
