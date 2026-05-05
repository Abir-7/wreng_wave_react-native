import { api } from "@/lib/axios/axios";
import {
  MechanicDocumentResponse,
  MechanicProfilePayload,
  MechanicProfileResponse,
} from "@/types/api/mechanic.types";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

export const useUploadMechanicDocuments = () => {
  return useMutation({
    mutationFn: async (
      formData: FormData,
    ): Promise<MechanicDocumentResponse> => {
      const { data } = await api.post<MechanicDocumentResponse>(
        "/mechanic/save-mechanic-image-data",
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
        error.response?.data?.message || "Document upload failed.";
      Toast.show({
        type: "error",
        text1: "Upload Error",
        text2: errorMessage,
      });
    },
  });
};

export const useAddMechanicData = () => {
  return useMutation({
    mutationFn: async (
      payload: MechanicProfilePayload,
    ): Promise<MechanicProfileResponse> => {
      const { data } = await api.post<MechanicProfileResponse>(
        "/mechanic/save-mechanic-data",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Mechanic profile completed successfully.",
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to add mechanic data.";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    },
  });
};
