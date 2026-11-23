"use client";
import { seedFacts } from "@/data/facts";
import { seedSubmissions } from "@/data/submissions";
import { seedActivity, seedAssets, seedBrand, seedSourceChanges, seedSources, seedStamps, seedTeam } from "@/data/misc";
import type { Activity, Asset, Brand, Fact, Source, SourceChange, Stamp, Submission, TeamUser } from "@/data/types";
import { useLocalStorage } from "./useLocalStorage";
import type { ReviewVote } from "./reviewerInsights";

// Every collection persists in localStorage under a versioned key so schema changes never load stale shapes.
const k = (name: string) => `ct.v1.${name}`;

export const useFacts = () => useLocalStorage<Fact[]>(k("facts"), seedFacts);
export const useSubmissions = () => useLocalStorage<Submission[]>(k("submissions"), seedSubmissions);
export const useBrand = () => useLocalStorage<Brand>(k("brand"), seedBrand);
export const useAssets = () => useLocalStorage<Asset[]>(k("assets"), seedAssets);
export const useSources = () => useLocalStorage<Source[]>(k("sources"), seedSources);
export const useSourceChanges = () => useLocalStorage<SourceChange[]>(k("source-changes"), seedSourceChanges);
export const useStamps = () => useLocalStorage<Stamp[]>(k("stamps"), seedStamps);
export const useTeam = () => useLocalStorage<TeamUser[]>(k("team"), seedTeam);
export const useActivity = () => useLocalStorage<Activity[]>(k("activity"), seedActivity);

export function resetAllSampleData() {
  Object.keys(window.localStorage).filter((x) => x.startsWith("ct.v1.")).forEach((x) => window.localStorage.removeItem(x));
}

export const STATUS_LABEL: Record<string, string> = {
  draft: "Draft", pending: "Pending review", changes: "Changes requested", approved: "Approved", rejected: "Rejected",
  candidate: "Candidate", expired: "Expired",
};

export const useReviewVotes = () => useLocalStorage<ReviewVote[]>(k("reviewer-votes"), []);
