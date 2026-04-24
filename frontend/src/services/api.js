const BASE_URL = "http://localhost:5000"; // backend will run here

export const reportIssue = async (data) => {
  console.log("Sending to backend:", data);

  return {
    message: "Mock success"
  };
};