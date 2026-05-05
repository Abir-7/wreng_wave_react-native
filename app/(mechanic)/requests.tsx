import { View, Text } from "react-native";
import FormWrapper from "@/components/form_wrapper";
import ScreenWrapper from "@/components/screen_wrapper";

export default function MechanicRequestsScreen() {
  return (
    <ScreenWrapper headerShown={false}>
      <FormWrapper title="Service Requests" subtitle="Pending and completed jobs">
        <View>
          <Text>Service Requests Coming Soon...</Text>
        </View>
      </FormWrapper>
    </ScreenWrapper>
  );
}
