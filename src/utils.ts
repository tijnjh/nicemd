export function getErrorMessage(error: Error) {
  if (error && typeof error === "object" && "message" in error) {
    return error.message as string;
  }

  if ("toString" in error && typeof error.toString === "function") {
    return error.toString();
  }

  return error.toString();
}
