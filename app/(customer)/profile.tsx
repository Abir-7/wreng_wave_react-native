import { View, Text } from "react-native";
import FormWrapper from "@/components/form_wrapper";
import ScreenWrapper from "@/components/screen_wrapper";

export default function ProfileScreen() {
  return (
    <ScreenWrapper headerShown={false}>
      <FormWrapper
        title="Profile"
        subtitle="Manage your account settings"
      >
        <View>
          <Text>Profile Settings Coming Soon...</Text>
        </View>
      </FormWrapper>
    </ScreenWrapper>
  );
}
