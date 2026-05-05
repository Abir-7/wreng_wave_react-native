import { View, Text } from "react-native";
import FormWrapper from "@/components/form_wrapper";

export default function ProfileScreen() {
  return (
    <FormWrapper 
      title="Profile" 
      subtitle="Manage your account settings"
      headerShown={false}
    >
      <View>
        <Text>Profile Settings Coming Soon...</Text>
      </View>
    </FormWrapper>
  );
}
