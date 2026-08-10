import {
  Building2Icon,
  FlagIcon,
  InboxIcon,
  LayoutListIcon,
  MessageSquareIcon,
  SendIcon,
} from "lucide-react";

const EMPTY_BY_TAB = {
  all: {
    icon: LayoutListIcon,
    title: "No feedback surveys yet",
    description:
      "Optional post-submit survey responses will appear here after visitors complete a form.",
  },
  quick_contact: {
    icon: SendIcon,
    title: "No Quick Contact surveys",
    description: "Surveys submitted after Quick Contact will appear here.",
  },
  report_info: {
    icon: FlagIcon,
    title: "No Report Info surveys",
    description: "Surveys submitted after Report Info will appear here.",
  },
  contact: {
    icon: InboxIcon,
    title: "No Contact surveys",
    description: "Surveys submitted after the Contact form will appear here.",
  },
  get_listed: {
    icon: Building2Icon,
    title: "No Get Listed surveys",
    description: "Surveys submitted after Get Listed will appear here.",
  },
};

export default function FeedbackSurveysEmptyState({ activeTab = "all" }) {
  const content = EMPTY_BY_TAB[activeTab] ?? EMPTY_BY_TAB.all;
  const Icon = content.icon ?? MessageSquareIcon;

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{content.title}</p>
        <p className="text-sm text-muted-foreground">{content.description}</p>
      </div>
    </div>
  );
}
