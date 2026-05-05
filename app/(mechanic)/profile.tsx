import { View, Text } from "react-native";
import FormWrapper from "@/components/form_wrapper";
import ScreenWrapper from "@/components/screen_wrapper";

export default function MechanicProfileScreen() {
  return (
    <ScreenWrapper headerShown={false}>
      <FormWrapper
        title="Mechanic Profile"
        subtitle="Update your business details"
      >
        <View>
          <Text>Profile Settings Coming Soon...</Text>
        </View>
      </FormWrapper>
    </ScreenWrapper>
  );
}
