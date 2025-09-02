interface ApiError {
  data?: {
    detail?: string;
  };
  message?: string;
  details?: string;
  [key: string]: any;
}

type ErrorType = string | ApiError | any[];

export const getErrorMessage = (error: ErrorType): string => {
  // Check if the error is a string (common case in some APIs)
  if (typeof error === "string") {
    return error;
  }

  // Check if error contains a "data" field with a "detail" message
  if (typeof error === "object" && error !== null && !Array.isArray(error)) {
    const apiError = error as ApiError;
    if (apiError.data?.detail) {
      return apiError.data.detail;
    }

    // If the error has a "message" field, return it
    if (apiError.message) {
      return apiError.message;
    }

    // If the error is an object with "details", return it
    if (apiError.details) {
      return apiError.details;
    }

    // Look for other common error fields and return them
    const keys = Object.keys(apiError);
    if (keys.length > 0) {
      let errorMessage = "";
      keys.forEach((key) => {
        if (Array.isArray(apiError[key])) {
          errorMessage += apiError[key].join(", ") + " ";
        } else {
          errorMessage += apiError[key] + " ";
        }
      });
      return errorMessage.trim();
    }
  }

  // If it's an array, join it into a single string
  if (Array.isArray(error)) {
    return error.join(", ");
  }

  // Default message when no known structure is found
  return "An unexpected error occurred.";
};