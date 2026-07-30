/**
 * Standardized service response format.
 * Ensures compatibility if switching from LocalStorage to Supabase or another backend.
 */
export const createResponse = (success, data = null, message = "", error = null) => {
  return {
    success,
    data,
    message,
    error
  };
};

export const createSuccess = (data = null, message = "Operation completed successfully.") => {
  return createResponse(true, data, message, null);
};

export const createError = (message = "Operation failed.", error = null) => {
  return createResponse(false, null, message, error);
};
