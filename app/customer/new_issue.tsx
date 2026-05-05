import ServiceRequestSection from "@/components/customer/new_issue_form";

import ScreenWrapper from "@/components/screen_wrapper";
import React from "react";

const New_issue = () => {
  return (
    <ScreenWrapper page_title="Scedule a service">
      <ServiceRequestSection></ServiceRequestSection>
    </ScreenWrapper>
  );
};

export default New_issue;
