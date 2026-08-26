import { EmptyState } from "@/components/ui/EmptyState";
import { RetroCard } from "@/components/ui/RetroCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export default function JournalPage() {
  return (
    <div className="p-5 flex flex-col gap-5">
      <ScreenHeader title="journal" />
      <RetroCard>
        <EmptyState
          title="coming soon!"
          subtitle="This screen gets built in a later phase — the foundation is what's live right now."
        />
      </RetroCard>
    </div>
  );
}
