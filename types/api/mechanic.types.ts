export type MechanicDocumentResponse = {
  profile_image_url: string;
  national_id_image_url: string;
  certificate_image_urls: string[];
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
  message: string;
};
