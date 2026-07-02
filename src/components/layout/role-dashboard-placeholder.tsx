type RoleDashboardPlaceholderProps = {
  title: string;
  description: string;
};

export function RoleDashboardPlaceholder({
  title,
  description,
}: RoleDashboardPlaceholderProps) {
  return (
    <main className="min-h-svh bg-[#eff6ff] px-6 py-8 text-[#111827]">
      <section className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[430px] flex-col justify-center rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-alhamra-blue">
          Dashboard
        </p>
        <h1 className="mt-3 text-2xl font-extrabold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[#6b7280]">{description}</p>
      </section>
    </main>
  );
}
