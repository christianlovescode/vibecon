import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="font-bold text-xl text-gray-900">Vibecon</div>
    </Link>
  );
}

