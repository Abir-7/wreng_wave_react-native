import { api } from "@/lib/axios/axios";
import {
  CarDataPayload,
  CarDataResponse,
  CarImageUploadResponse,
} from "@/types/api/car.types";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

export const useUploadCarImage = () => {
  return useMutation({
    mutationFn: async (formData: FormData): Promise<CarImageUploadResponse> => {
      const { data } = await api.post<CarImageUploadResponse>(
        "/customer/add-cars-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return data;
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Image upload failed.";
      Toast.show({
        type: "error",
        text1: "Upload Error",
        text2: errorMessage,
      });
    },
  });
};

export const useAddCarData = () => {
  return useMutation({
    mutationFn: async (payload: CarDataPayload): Promise<CarDataResponse> => {
      const { data } = await api.post<CarDataResponse>(
        "/customer/add-cars-data",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Car data added successfully.",
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to add car data.";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    },
  });
};
