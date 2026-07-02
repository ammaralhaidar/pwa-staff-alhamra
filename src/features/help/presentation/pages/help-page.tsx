
import { useState } from "react";
import { helpFaqs } from "@/features/help/infrastructure/help-faqs";
import { HelpAccordion } from "@/features/help/presentation/components/help-accordion";
import { HelpHeader } from "@/features/help/presentation/components/help-header";

export function HelpPage() {
  const [activeId, setActiveId] = useState<string | null>(null);

  function handleToggle(id: string) {
    setActiveId((currentId) => (currentId === id ? null : id));
  }

  return (
    <main className="help-stage min-h-svh bg-white">
      <HelpHeader />
      <section className="mx-auto max-w-[700px] px-9 pb-16 pt-24 md:px-0 md:pt-28">
        <HelpAccordion items={helpFaqs} activeId={activeId} onToggle={handleToggle} />
      </section>
    </main>
  );
}