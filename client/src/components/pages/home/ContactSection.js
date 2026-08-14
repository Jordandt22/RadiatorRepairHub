import {
  formatBusinessPhoneDisplay,
  getBusinessEmail,
  getBusinessPhoneDigits,
  getBusinessPhoneSmsHref,
  getBusinessPhoneTelHref,
} from "@/lib/businessContactInfo";

import ContactSectionContent from "./ContactSectionContent";

function ContactSection() {
  const email = getBusinessEmail();
  const phoneDigits = getBusinessPhoneDigits();

  return (
    <ContactSectionContent
      email={email}
      phoneDisplay={phoneDigits ? formatBusinessPhoneDisplay(phoneDigits) : null}
      phoneTelHref={phoneDigits ? getBusinessPhoneTelHref(phoneDigits) : null}
      phoneSmsHref={phoneDigits ? getBusinessPhoneSmsHref(phoneDigits) : null}
    />
  );
}

export default ContactSection;
