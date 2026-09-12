import Link from "next/link";
export default function CommerceShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="commerce">
      <header>
        <Link href="/" className="brand">
          夢重力<span>マクラ</span>
        </Link>
        <nav>
          <Link href="/return">返品する</Link>
          <Link href="/terms">利用規約</Link>
        </nav>
      </header>
      <div className="commerce-wrap">{children}</div>
      <footer>
        <Link href="/">トップページ</Link>
        <a href="mailto:s.hasegawa1130@gmail.com">お問い合わせ</a>
      </footer>
    </main>
  );
}
