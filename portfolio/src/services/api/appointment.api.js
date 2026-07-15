import { axiosInstance } from "./axiosInstance";

export const submitAppointment = async (data) => {
  const response = await axiosInstance.post("/appointments", data);
  return response.data;
};
