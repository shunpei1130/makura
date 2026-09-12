import CommerceShell from "@/app/components/commerce-shell";
export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default function Login() {
  return (
    <CommerceShell>
      <h1>管理者ログイン</h1>
      <p>許可されたGoogleアカウントでログインしてください。</p>
      <a className="button" href="/api/auth/google">
        Googleでログイン
      </a>
    </CommerceShell>
  );
}
