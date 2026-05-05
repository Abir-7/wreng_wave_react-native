import { useAddMechanicData, useUploadMechanicDocuments } from "@/api/mechanic.api";
import { Colors } from "@/colors/colors";
import FormWrapper from "@/components/form_wrapper";
import InputField from "@/components/input_field";
import GlobalLoading from "@/components/global_loading";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Image, StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native";
import { z } from "zod";

const mechanicSchema = z.object({
  shop_name: z.string().min(2, "Shop name must be at least 2 characters"),
  initial_charge: z.string().min(1, "Initial charge is required"),
  year_of_experience: z.string().min(1, "Year of experience is required"),
  specialist: z.array(z.string().min(1)).min(1, "At least one specialist is required"),
  service_area: z.string().min(2, "Service area must be at least 2 characters"),
  profile_image: z.string().min(1, "Profile image is required"),
  national_id_image: z.string().min(1, "National ID image is required"),
  certificate_images: z.array(z.string().min(1)).min(1, "At least one certificate image is required"),
});

type MechanicForm = z.infer<typeof mechanicSchema>;

const ImageSection = ({ 
  label, 
  value, 
  onPick, 
  multiple = false, 
  onRemove 
}: { 
  label: string; 
  value: string | string[]; 
  onPick: () => void; 
  multiple?: boolean;
  onRemove?: (index: number) => void;
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.imageRow}>
        {multiple && Array.isArray(value) ? (
          <>
            {value.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.thumbnail} />
                <TouchableOpacity 
                  style={styles.removeIcon} 
                  onPress={() => onRemove && onRemove(index)}
                >
                  <Ionicons name="close-circle" size={20} color="#E53935" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={onPick}>
              <Ionicons name="add" size={30} color="#888" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.singleImagePicker} onPress={onPick}>
            {typeof value === 'string' && value ? (
              <Image source={{ uri: value }} style={styles.fullImage} />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="camera" size={30} color="#888" />
                <Text style={styles.placeholderText}>Select</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function MechanicCompleteProfileScreen() {
    const router = useRouter();
    const { user_id } = useLocalSearchParams<{ user_id: string }>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Please wait...");
  
    const { mutateAsync: uploadDocuments } = useUploadMechanicDocuments();
    const { mutateAsync: addMechanicData } = useAddMechanicData();
  
    const onSubmit = async (data: MechanicForm) => {
      try {
        setIsSubmitting(true);
  
        // 1. Prepare FormData for all documents
        setLoadingMessage("Uploading documents...");
        const formData = new FormData();
        
        const appendFile = (uri: string, fieldName: string) => {
          const filename = uri.split("/").pop();
          const match = /\.(\w+)$/.exec(filename || "");
          const type = match ? `image/${match[1]}` : `image`;
          formData.append(fieldName, { uri, name: filename, type } as any);
        };

        appendFile(data.profile_image, "profile_image");
        appendFile(data.national_id_image, "national_id_image");
        data.certificate_images.forEach((uri) => {
          formData.append("certificate_images", { 
            uri, 
            name: uri.split("/").pop(), 
            type: `image/${uri.split(".").pop()}` 
          } as any);
        });

        // 2. Upload all documents in one API call
        const { 
          profile_image_url, 
          national_id_image_url, 
          certificate_image_urls 
        } = await uploadDocuments(formData);
  
        // 3. Submit text fields + returned URLs to the second API
        setLoadingMessage("Saving profile details...");
        await addMechanicData({
          user_id: user_id!,
          shop_name: data.shop_name,
          initial_charge: parseFloat(data.initial_charge),
          year_of_experience: parseInt(data.year_of_experience),
          specialist: data.specialist,
          service_area: data.service_area,
          profile_image: profile_image_url,
          national_id_image: national_id_image_url,
          certificate_images: certificate_image_urls,
        });

        // ✅ Update store flag
        useAuthStore.setState({ is_mechanic_data_complete: true });
  
        router.replace("/(mechanic)/home");
      } catch (error) {
        console.error("Failed to complete mechanic profile:", error);
      } finally {
        setIsSubmitting(false);
      }
    };
  
    return (
      <>
        <GlobalLoading visible={isSubmitting} message={loadingMessage} />
        <FormWrapper
          title="Complete Profile"
          subtitle="Fill in your details to continue"
          resolver={zodResolver(mechanicSchema)}
          defaultValues={{
            shop_name: "",
            initial_charge: "",
            year_of_experience: "",
            specialist: [],
            service_area: "",
            profile_image: "",
            national_id_image: "",
            certificate_images: [],
          }}
          onSubmit={onSubmit}
        >
          <MechanicFormContent />
        </FormWrapper>
      </>
    );
}

const MechanicFormContent = () => {
    const { setValue, control, getValues } = useFormContext<MechanicForm>();
    
    const profileImage = useWatch({ control, name: "profile_image" });
    const nationalIdImage = useWatch({ control, name: "national_id_image" });
    const certificateImages = useWatch({ control, name: "certificate_images" }) || [];
    const specialists = useWatch({ control, name: "specialist" }) || [];
    
    const [tempSpec, setTempSpec] = useState("");

    const handlePickImage = async (field: keyof MechanicForm, multiple = false) => {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: !multiple,
          aspect: [1, 1],
          quality: 0.8,
        });
    
        if (!result.canceled) {
          const uri = result.assets[0].uri;
          if (multiple) {
            const current = (getValues(field) as string[]) || [];
            setValue(field, [...current, uri] as any, { 
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true
            });
          } else {
            setValue(field, uri as any, { 
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true
            });
          }
        }
      };

    const addSpec = () => {
        if (tempSpec.trim()) {
            setValue("specialist", [...specialists, tempSpec.trim()], { shouldValidate: true });
            setTempSpec("");
        }
    }

    const removeSpec = (index: number) => {
        setValue("specialist", specialists.filter((_, i) => i !== index), { shouldValidate: true });
    }

    return (
        <View>
            <View style={styles.imagePickersRow}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    <ImageSection 
                        label="Profile Image" 
                        value={profileImage} 
                        onPick={() => handlePickImage("profile_image")} 
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <ImageSection 
                        label="National ID" 
                        value={nationalIdImage} 
                        onPick={() => handlePickImage("national_id_image")} 
                    />
                </View>
            </View>

            <ImageSection 
                label="Certificates" 
                value={certificateImages} 
                multiple 
                onPick={() => handlePickImage("certificate_images", true)} 
                onRemove={(index) => {
                    const current = (getValues("certificate_images") as string[]) || [];
                    setValue("certificate_images", current.filter((_, i) => i !== index), { shouldValidate: true });
                }}
            />

            <InputField<MechanicForm> name="shop_name" label="Shop Name" placeholder="e.g. Quick Fix Garage" />
            
            <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    <InputField<MechanicForm> name="initial_charge" label="Initial Charge" placeholder="e.g. 50" keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                    <InputField<MechanicForm> name="year_of_experience" label="Experience (Years)" placeholder="e.g. 5" keyboardType="numeric" />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionLabel}>Specialists</Text>
                <View style={styles.tagContainer}>
                    {specialists.map((spec, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{spec}</Text>
                            <TouchableOpacity onPress={() => removeSpec(index)}>
                                <Ionicons name="close-circle" size={16} color="#666" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
                <View style={styles.addTagRow}>
                    <TextInput
                        style={styles.tagInput}
                        placeholder="Add specialist"
                        value={tempSpec}
                        onChangeText={setTempSpec}
                        onSubmitEditing={addSpec}
                    />
                    <TouchableOpacity style={styles.addTagButton} onPress={addSpec}>
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <InputField<MechanicForm> name="service_area" label="Service Area" placeholder="e.g. New York, Brooklyn" />
        </View>
    )
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },
  imageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  imagePickersRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  removeIcon: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "white",
    borderRadius: 10,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  singleImagePicker: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  tagText: {
    fontSize: 14,
    color: "#444",
  },
  addTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tagInput: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  addTagButton: {
    backgroundColor: Colors.secondary,
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
