import {
  Building2Icon,
  CheckIcon,
  FlagIcon,
  HelpCircleIcon,
  InboxIcon,
  MinusCircleIcon,
  SearchIcon,
  SendIcon,
  Share2Icon,
  UsersIcon,
  XCircleIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  FORM_TYPE_LABELS,
  FOUND_LOOKING_FOR_LABELS,
  FOUND_VIA_LABELS,
} from "@/components/pages/feedback-surveys/feedbackSurveyLabels";

const FORM_TYPE_CONFIG = {
  quick_contact: {
    Icon: SendIcon,
    className: "border-transparent bg-blue-100 text-blue-800",
  },
  report_info: {
    Icon: FlagIcon,
    className: "border-transparent bg-orange-100 text-orange-800",
  },
  contact: {
    Icon: InboxIcon,
    className: "border-transparent bg-violet-100 text-violet-800",
  },
  get_listed: {
    Icon: Building2Icon,
    className: "border-transparent bg-emerald-100 text-emerald-800",
  },
};

const FOUND_VIA_CONFIG = {
  google_search: {
    Icon: SearchIcon,
    className: "border-transparent bg-sky-100 text-sky-800",
  },
  referral: {
    Icon: UsersIcon,
    className: "border-transparent bg-amber-100 text-amber-800",
  },
  social_media: {
    Icon: Share2Icon,
    className: "border-transparent bg-pink-100 text-pink-800",
  },
  other: {
    Icon: HelpCircleIcon,
    className: "border-transparent bg-zinc-100 text-zinc-700",
  },
};

const FOUND_LOOKING_FOR_CONFIG = {
  yes: {
    Icon: CheckIcon,
    className: "border-transparent bg-emerald-100 text-emerald-800",
  },
  no: {
    Icon: XCircleIcon,
    className: "border-transparent bg-red-100 text-red-800",
  },
  partially: {
    Icon: MinusCircleIcon,
    className: "border-transparent bg-amber-100 text-amber-800",
  },
};

function SurveyBadge({ value, labels, configMap }) {
  const config = configMap[value] ?? {
    Icon: null,
    className: "border-transparent bg-zinc-100 text-zinc-700",
  };
  const Icon = config.Icon;
  const label = labels[value] ?? value ?? "Unknown";

  return (
    <Badge variant="outline" className={config.className}>
      {Icon ? <Icon data-icon="inline-start" /> : null}
      {label}
    </Badge>
  );
}

export function FeedbackSurveyFormTypeBadge({ formType }) {
  return (
    <SurveyBadge
      value={formType}
      labels={FORM_TYPE_LABELS}
      configMap={FORM_TYPE_CONFIG}
    />
  );
}

export function FeedbackSurveyFoundViaBadge({ foundVia }) {
  return (
    <SurveyBadge
      value={foundVia}
      labels={FOUND_VIA_LABELS}
      configMap={FOUND_VIA_CONFIG}
    />
  );
}

export function FeedbackSurveyFoundLookingForBadge({ foundLookingFor }) {
  return (
    <SurveyBadge
      value={foundLookingFor}
      labels={FOUND_LOOKING_FOR_LABELS}
      configMap={FOUND_LOOKING_FOR_CONFIG}
    />
  );
}
