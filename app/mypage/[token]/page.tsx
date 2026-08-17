import Link from "next/link";
import { notFound } from "next/navigation";
import { getReferralCount } from "@/lib/referrals";
import { daysRemaining, formatDate, formatYen } from "@/lib/format";
import { getTrialByToken } from "@/lib/trials";
import ReturnForm from "@/app/components/return-form";
import CopyButton from "@/app/components/copy-button";
import UpdatePaymentForm from "@/app/components/update-payment-form";

export default async function MyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const trial = await getTrialByToken(token);
  if (!trial) notFound();
  const referralCount = await getReferralCount(trial.id);
  const remaining = daysRemaining(trial.trialEndsAt);
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const referralUrl = `${appUrl}/?ref=${encodeURIComponent(trial.referralCode)}`;
  const canReturn = trial.status === "active" && trial.returnStatus === "not_requested" && trial.chargeStatus !== "processing" && trial.chargeStatus !== "succeeded" && remaining > 0;
  const statusLabel = trial.status === "purchased" ? "購入完了" : trial.status === "return_requested" ? "返却申請済み" : trial.status === "payment_failed" ? "決済確認中" : trial.status === "pending_checkout" ? "カード登録待ち" : "試用中";

  return (
    <main className="dashboard-page">
      <header className="simple-header"><Link href="/" className="brand">夢重力<span>マクラ</span></Link><Link href="/">トップへ戻る</Link></header>
      <section className="dashboard-wrap">
        <div className="dashboard-intro"><div><p className="eyebrow">YOUR TRIAL DASHBOARD</p><h1>{trial.name} 様の<br /><em>マイページ</em></h1></div><span className="status-pill">● {statusLabel}</span></div>
        <div className="dashboard-main">
          <section className="dashboard-panel"><p className="eyebrow">FREE TRIAL</p><div className="dashboard-number">{remaining}</div><div className="dashboard-number-label">無料体験 残り日数</div><div className="info-list"><div><span>体験終了日 / 返却期限</span><strong>{formatDate(trial.trialEndsAt)}まで</strong></div><div><span>返却しない場合</span><strong>{formatDate(trial.trialEndsAt)}の翌日に {formatYen(13480)}</strong></div><div><span>選択した向き</span><strong>{trial.orientation === "horizontal" ? "横向き中心" : "仰向け中心"}</strong></div></div></section>
          <section className="dashboard-panel"><p className="eyebrow">SHARE THE SLEEP</p><h2>友達紹介</h2><p className="dashboard-copy">3人の申込が完了すると、あなたの試用期間が30日延長されます。</p><div className="referral-count"><strong>{referralCount}</strong><span>/ 3人 申込完了</span></div><div className="referral-link-box"><code>{referralUrl}</code><CopyButton text={referralUrl} /></div></section>
          <section className="dashboard-panel dashboard-full"><p className="eyebrow">RETURN / KEEP</p>{trial.status === "purchased" ? <div className="return-action"><div><h3>夢重力マクラはあなたのものです。</h3><p>決済が完了しました。引き続き快適な睡眠をお楽しみください。</p></div></div> : trial.status === "return_requested" ? <div className="return-action"><div><h3>返却申請済みです。</h3><p>受付番号 <strong>{trial.returnCode}</strong> を使って返送してください。到着確認後、TRY専用在庫として処理します。</p></div></div> : trial.status === "pending_checkout" ? <div className="return-action"><div><h3>カード登録がまだ完了していません。</h3><p>Stripeのカード登録が完了すると、30日試眠が始まります。</p></div><Link className="button button-primary" href="/">申込を再開する</Link></div> : trial.status === "payment_failed" ? <UpdatePaymentForm token={token} /> : <ReturnForm token={token} canReturn={canReturn} />}</section>
        </div>
      </section>
    </main>
  );
}
