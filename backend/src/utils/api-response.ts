export const apiResponse = <T>(data: T, message = "Request successful") => ({
  success: true,
  message,
  data
});
