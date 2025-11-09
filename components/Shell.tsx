import Link from "next/link";

import { LayoutDashboard, Workflow, Users, Zap } from "lucide-react";

const Shell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen relative">
      {/* Grid background with fade effect */}

      <div
        className="flex items-center gap-2 relative "
        style={{ zIndex: 102 }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
            linear-gradient(to bottom, rgba(0,0,0,0.03) 0%, transparent 650px),
            repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, transparent 1px, transparent 20px, rgba(0,0,0,0.03) 21px),
            repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0px, transparent 1px, transparent 20px, rgba(0,0,0,0.03) 21px)
          `,
            maskImage:
              "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
            zIndex: 100,
          }}
        />
        <nav className="h-screen fixed bg-[#111] left-0 top-0 w-16  flex flex-col items-center justify-between space-y-4">
          <div className="w-16 h-16 flex items-center justify-center border-b border-white/10">
            <Zap className="text-white w-6 h-6" />
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
            <Link href="/dashboard">
              <LayoutDashboard className="text-white w-6 h-6" />
            </Link>
            <Link href="/workflow">
              <Workflow className="text-white w-6 h-6" />
            </Link>
            <Link href="/leads">
              <Users className="text-white w-6 h-6" />
            </Link>
          </div>

          <div></div>
        </nav>

        <main className="flex-1 h-full ml-16"> {children}</main>
      </div>
    </div>
  );
};

export default Shell;
