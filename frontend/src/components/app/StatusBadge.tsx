import type { FactStatus, Severity, SubmissionStatus } from "@/data/types";
import { Badge, type Tone } from "@/components/ui/Badge";

const sub: Record<SubmissionStatus, [string, Tone]> = {
  draft: ["Draft", "neutral"], pending: ["Pending review", "warn"], changes: ["Changes requested", "brand"], approved: ["Approved", "ok"], rejected: ["Rejected", "bad"],
};
const fact: Record<FactStatus, [string, Tone]> = {
  candidate: ["Candidate", "warn"], approved: ["Approved", "ok"], expired: ["Expired", "neutral"], rejected: ["Rejected", "bad"],
};
const sev: Record<Severity, [string, Tone]> = { critical: ["Critical", "bad"], major: ["Major", "warn"], minor: ["Minor", "neutral"] };

export const SubmissionBadge = ({ status }: { status: SubmissionStatus }) => <Badge tone={sub[status][1]}>{sub[status][0]}</Badge>;
export const FactBadge = ({ status }: { status: FactStatus }) => <Badge tone={fact[status][1]}>{fact[status][0]}</Badge>;
export const SeverityBadge = ({ severity }: { severity: Severity }) => <Badge tone={sev[severity][1]}>{sev[severity][0]}</Badge>;
