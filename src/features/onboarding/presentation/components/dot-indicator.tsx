export function DotIndicator({ count, activeIndex, onSelect }: { count: number; activeIndex: number; onSelect: (index: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-2" aria-label="Indikator onboarding">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(index)}
          className={index === activeIndex ? "h-2.5 w-2.5 rounded-full bg-alhamra-blue" : "h-2.5 w-2.5 rounded-full bg-[#dfdfdf]"}
          aria-label={`Buka slide ${index + 1}`}
        />
      ))}
    </div>
  );
}