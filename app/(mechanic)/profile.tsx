import { View, Text } from "react-native";
import FormWrapper from "@/components/form_wrapper";

export default function MechanicProfileScreen() {
  return (
    <FormWrapper 
      title="Mechanic Profile" 
      subtitle="Update your business details"
      headerShown={false}
    >
      <View>
        <Text>Profile Settings Coming Soon...</Text>
      </View>
    </FormWrapper>
  );
}
