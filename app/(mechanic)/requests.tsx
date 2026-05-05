import { View, Text } from "react-native";
import FormWrapper from "@/components/form_wrapper";

export default function MechanicRequestsScreen() {
  return (
    <FormWrapper title="Service Requests" subtitle="Pending and completed jobs">
      <View>
        <Text>Service Requests Coming Soon...</Text>
      </View>
    </FormWrapper>
  );
}
