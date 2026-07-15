import { axiosInstance } from "./axiosInstance";

export const getDoctors = async () => {
  const response = await axiosInstance.get("/doctors");
  return response.data;
};
