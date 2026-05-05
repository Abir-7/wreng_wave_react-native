export type CarImageUploadResponse = {
  image_data_id: string;
};

export type CarItemPayload = {
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  tag_number: string;
  car_image_id: string;
};

export type CarDataPayload = CarItemPayload[];

export type CarDataResponse = {
  message: string;
};

export interface MyCarsResponse {
  id: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  tag_number: string;
  user_id: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}
