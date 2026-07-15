import { axiosInstance } from "./axiosInstance";

export const getGalleryItems = async () => {
  const response = await axiosInstance.get("/gallery");
  return response.data;
};
