export type CarImageUploadResponse = {
  image_url: string;
};

export type CarDataPayload = {
  user_id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  color: string;
  image_url: string;
};

export type CarDataResponse = {
  message: string;
  car_id: string;
};
