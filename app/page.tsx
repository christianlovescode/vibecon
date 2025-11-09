"use client";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans">
      <div className="h-[90vh] w-full relative">
        <div
          className="absolute inset-0 top-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(0, 0, 0, 0.12) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        <div className="max-w-4xl mx-auto py-16">
          <h1 className="text-4xl font-bold">
            <span className="text-primary">HyperPage</span>
            <span className="text-secondary"> is a platform for creating and managing your leads.</span>
          </h1>
        </div>
      </div>
    </div>
  );
}
