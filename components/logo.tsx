import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image src="/dunbar.svg" alt="logo" width={150} height={200} />
    </Link>
  );
}
