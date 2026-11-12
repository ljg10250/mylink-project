import Link from "next/link";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="MyLink 홈">
      <span className="brand-mark" aria-hidden="true">↗</span>
      <span>MyLink</span>
    </Link>
  );
}
