import { useAddCarData, useUploadCarImage } from "@/api/car.api";
import { Colors } from "@/colors/colors";
import FormWrapper from "@/components/form_wrapper";
import InputField from "@/components/input_field";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { z } from "zod";

const carItemSchema = z.object({
  make: z.string().min(2, "Make must be at least 2 characters"),
  model: z.string().min(2, "Model must be at least 2 characters"),
  year: z.string().regex(/^\d{4}$/, "Year must be 4 digits"),
  license_plate: z
    .string()
    .min(3, "License plate must be at least 3 characters"),
  color: z.string().min(3, "Color must be at least 3 characters"),
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
  const { setValue, watch } = useFormContext<CarForm>();
  const image = watch(`cars.${index}.image`);

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
        name={`cars.${index}.make`}
        label="Make"
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
        name={`cars.${index}.color`}
        label="Color"
        placeholder="e.g. White"
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
            make: "",
            model: "",
            year: "",
            license_plate: "",
            color: "",
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
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: uploadImage } = useUploadCarImage();
  const { mutateAsync: addCarAsync } = useAddCarData();

  const onSubmit = async (data: CarForm) => {
    try {
      setIsSubmitting(true);

      for (const car of data.cars) {
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

        // 2. Upload image
        const { image_url } = await uploadImage(formData);

        // 3. Submit car data with image URL
        await addCarAsync({
          user_id: user_id!,
          make: car.make,
          model: car.model,
          year: parseInt(car.year),
          license_plate: car.license_plate,
          color: car.color,
          image_url: image_url,
        });
      }

      router.replace("/customer/home");
    } catch (error) {
      console.error("Failed to add car(s):", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormWrapper
      isLoading={isSubmitting}
      title="Add Your Cars"
      subtitle="Please provide your car details to continue"
      resolver={zodResolver(carSchema)}
      defaultValues={{
        cars: [
          {
            make: "",
            model: "",
            year: "",
            license_plate: "",
            color: "",
            image: "",
          },
        ],
      }}
      onSubmit={onSubmit}
      submitLabel="Submit All Cars"
    >
      <CarListContent />
    </FormWrapper>
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
