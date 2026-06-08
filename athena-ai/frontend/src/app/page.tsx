export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto flex max-w-5xl flex-col gap-6">
        <div>
          <p className="text-sm font-medium uppercase text-accent">
            Autonomous Decision Intelligence
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-ink">Athena AI</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
            A production-oriented platform scaffold for decision workflows, auditability,
            and agent orchestration. Business logic will be added after the first workflow
            contract is defined.
          </p>
        </div>
      </section>
    </main>
  );
}
