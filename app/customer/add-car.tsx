import { useAddCarData, useUploadCarImage } from "@/api/car.api";
import { Colors } from "@/colors/colors";
import FormWrapper from "@/components/form_wrapper";
import InputField from "@/components/input_field";
import GlobalLoading from "@/components/global_loading";
import ScreenWrapper from "@/components/screen_wrapper";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { z } from "zod";

const carItemSchema = z.object({
  brand: z.string().min(2, "Brand must be at least 2 characters"),
  model: z.string().min(2, "Model must be at least 2 characters"),
  year: z.string().regex(/^\d{4}$/, "Year must be 4 digits"),
  license_plate: z
    .string()
    .min(3, "License plate must be at least 3 characters"),
  tag_number: z.string().min(1, "Tag number is required"),
  image: z.string().min(1, "Please select a car image"),
});

const carSchema = z.object({
  cars: z.array(carItemSchema).min(1),
});

type CarForm = z.infer<typeof carSchema>;

const CarItem = ({
  index,
  remove,
  isLast,
}: {
  index: number;
  remove: (index: number) => void;
  isLast: boolean;
}) => {
  const { setValue, control } = useFormContext<CarForm>();
  const image = useWatch({ control, name: `cars.${index}.image` });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setValue(`cars.${index}.image`, result.assets[0].uri, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  };

  return (
    <View style={styles.carCard}>
      <View style={styles.carHeader}>
        <Text style={styles.carTitle}>Car #{index + 1}</Text>
        {index > 0 && (
          <TouchableOpacity onPress={() => remove(index)}>
            <Ionicons name="trash-outline" size={24} color="#E53935" />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera" size={40} color="#888" />
            <Text style={styles.placeholderText}>Select Car Image</Text>
          </View>
        )}
      </TouchableOpacity>

      <InputField<CarForm>
        name={`cars.${index}.brand`}
        label="Brand"
        placeholder="e.g. Toyota"
      />
      <InputField<CarForm>
        name={`cars.${index}.model`}
        label="Model"
        placeholder="e.g. Corolla"
      />
      <InputField<CarForm>
        name={`cars.${index}.year`}
        label="Year"
        placeholder="e.g. 2022"
        keyboardType="numeric"
      />
      <InputField<CarForm>
        name={`cars.${index}.license_plate`}
        label="License Plate"
        placeholder="e.g. ABC-1234"
      />
      <InputField<CarForm>
        name={`cars.${index}.tag_number`}
        label="Tag Number"
        placeholder="e.g. 123"
      />
      {!isLast && <View style={styles.divider} />}
    </View>
  );
};

const CarListContent = () => {
  const { control } = useFormContext<CarForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "cars",
  });

  return (
    <View>
      {fields.map((field, index) => (
        <CarItem
          key={field.id}
          index={index}
          remove={remove}
          isLast={index === fields.length - 1}
        />
      ))}

      <TouchableOpacity
        style={styles.addMoreButton}
        onPress={() =>
          append({
            brand: "",
            model: "",
            year: "",
            license_plate: "",
            tag_number: "",
            image: "",
          })
        }
      >
        <Ionicons name="add-circle-outline" size={24} color={Colors.secondary} />
        <Text style={styles.addMoreText}>Add Another Car</Text>
      </TouchableOpacity>
    </View>
  );
};

const AddCar = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Please wait...");
  const { user_id } = useLocalSearchParams<{ user_id: string }>();

  const { mutateAsync: uploadImage } = useUploadCarImage();
  const { mutateAsync: addCarBulkAsync } = useAddCarData();

  const onSubmit = async (data: CarForm) => {
    try {
      setIsSubmitting(true);

      const carsPayload = [];

      for (let i = 0; i < data.cars.length; i++) {
        const car = data.cars[i];
        setLoadingMessage(`Uploading image for car #${i + 1}...`);

        // 1. Prepare form data for image upload
        const formData = new FormData();
        const filename = car.image.split("/").pop();
        const match = /\.(\w+)$/.exec(filename || "");
        const type = match ? `image/${match[1]}` : `image`;

        formData.append("image", {
          uri: car.image,
          name: filename,
          type,
        } as any);

        // 2. Upload image and get image_data_id
        const { image_data_id } = await uploadImage(formData);

        // 3. Add to bulk payload
        carsPayload.push({
          brand: car.brand,
          model: car.model,
          year: parseInt(car.year),
          license_plate: car.license_plate,
          tag_number: car.tag_number,
          car_image_id: image_data_id,
        });
      }

      setLoadingMessage("Saving car details...");
      // 4. Submit bulk car data
      await addCarBulkAsync(carsPayload);

      // ✅ Update store flag
      useAuthStore.setState({ is_user_car_data_complete: true });

      router.replace("/(customer)/home");
    } catch (error) {
      console.error("Failed to add car(s):", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper>
      <GlobalLoading visible={isSubmitting} message={loadingMessage} />
      <FormWrapper
        title="Add Your Cars"
        subtitle="Please provide your car details to continue"
        resolver={zodResolver(carSchema)}
        defaultValues={{
          cars: [
            {
              brand: "",
              model: "",
              year: "",
              license_plate: "",
              tag_number: "",
              image: "",
            },
          ],
        }}
        onSubmit={onSubmit}
        submitLabel="Submit All Cars"
      >
        <CarListContent />
      </FormWrapper>
    </ScreenWrapper>
  );
};

export default AddCar;

const styles = StyleSheet.create({
  carCard: {
    marginBottom: 20,
  },
  carHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  carTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
  },
  imagePicker: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    alignItems: "center",
  },
  placeholderText: {
    marginTop: 8,
    color: "#888",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 20,
  },
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 12,
    borderStyle: "dashed",
    marginTop: 10,
    marginBottom: 30,
    gap: 8,
  },
  addMoreText: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: "600",
  },
});
