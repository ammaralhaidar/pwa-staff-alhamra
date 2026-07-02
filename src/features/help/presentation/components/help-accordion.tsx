
import { ChevronDown } from "lucide-react";
import type { HelpFaq } from "@/features/help/domain/help-faq";
import { cn } from "@/lib/utils";

type HelpAccordionProps = {
  items: HelpFaq[];
  activeId: string | null;
  onToggle: (id: string) => void;
};

export function HelpAccordion({ items, activeId, onToggle }: HelpAccordionProps) {
  return (
    <div className="space-y-9 md:space-y-8">
      {items.map((item) => {
        const isOpen = activeId === item.id;
        const panelId = `help-panel-${item.id}`;

        return (
          <section key={item.id} className="help-faq-item">
            <button
              type="button"
              className="flex w-full items-start justify-between gap-4 text-left"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => onToggle(item.id)}
            >
              <span className="max-w-[590px] text-[17px] font-bold leading-[1.35] text-black md:text-[26px]">
                {item.question}
              </span>
              <ChevronDown
                className={cn("mt-0.5 h-5 w-5 shrink-0 stroke-[2.2] text-black transition-transform duration-300 ease-out md:h-8 md:w-8", isOpen && "rotate-180")}
                aria-hidden="true"
              />
            </button>

            <div
              id={panelId}
              className={cn(
                "grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out",
                isOpen ? "mt-4 grid-rows-[1fr] opacity-100 md:mt-5" : "mt-0 grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="help-answer text-[16px] font-semibold leading-[1.42] text-[#1f2937] md:text-[25px] md:leading-[1.45]">
                  {item.answer}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}