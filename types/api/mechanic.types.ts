export type MechanicDocumentResponse = {
  mechanic_image_data_id: string;
};

export type MechanicProfilePayload = {
  user_id: string;
  shop_name: string;
  initial_charge: number;
  year_of_experience: number;
  specialist: string[];
  service_area: string;
  profile_image: string; // URL returned from document API
  national_id_image: string; // URL returned from document API
  certificate_images: string[]; // URLs returned from document API
};

export type MechanicProfileResponse = {
  id: string;
  shop_name: string | null;
  initial_charge: number | null;
  year_of_experience: number;
  service_area: string;
  specialist: string[];
  user_id: string;
};
