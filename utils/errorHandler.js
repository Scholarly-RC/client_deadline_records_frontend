export const getErrorMessage = (error) => {
  // Check if the error is a string (common case in some APIs)
  if (typeof error === "string") {
    return error;
  }

  // Check if error contains a "data" field with a "detail" message
  if (error?.data?.detail) {
    return error.data.detail;
  }

  // If the error has a "message" field, return it
  if (error.message) {
    return error.message;
  }

  // If the error is an object with "details", return it
  if (error.details) {
    return error.details;
  }

  // If it's a more complex object, stringify it for inspection
  if (typeof error === "object") {
    // If it's an array, join it into a single string
    if (Array.isArray(error)) {
      return error.join(", ");
    }

    // Look for other common error fields and return them
    const keys = Object.keys(error);
    if (keys.length > 0) {
      let errorMessage = "";
      keys.forEach((key) => {
        if (Array.isArray(error[key])) {
          errorMessage += error[key].join(", ") + " ";
        } else {
          errorMessage += error[key] + " ";
        }
      });
      return errorMessage.trim();
    }
  }

  // Default message when no known structure is found
  return "An unexpected error occurred.";
};
