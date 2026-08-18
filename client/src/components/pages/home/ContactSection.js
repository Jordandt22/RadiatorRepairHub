import {
  formatBusinessPhoneDisplay,
  getBusinessEmail,
  getBusinessPhoneDigits,
  getBusinessPhoneSmsHref,
} from "@/lib/businessContactInfo";

import ContactSectionContent from "./ContactSectionContent";

function ContactSection() {
  const email = getBusinessEmail();
  const phoneDigits = getBusinessPhoneDigits();

  return (
    <ContactSectionContent
      email={email}
      phoneDisplay={phoneDigits ? formatBusinessPhoneDisplay(phoneDigits) : null}
      phoneSmsHref={phoneDigits ? getBusinessPhoneSmsHref(phoneDigits) : null}
    />
  );
}

export default ContactSection;
