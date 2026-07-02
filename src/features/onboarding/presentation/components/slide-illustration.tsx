

export function SlideIllustration({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative grid h-52 w-52 place-items-center rounded-full bg-white shadow-soft">
      <img src={src} alt={alt} className="h-[172px] w-[172px] object-contain" />
    </div>
  );
}