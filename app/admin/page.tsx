"use client";

import { useState } from "react";
import Link from "next/link";

type AdminTrial = { id: string; name: string; email: string; orientation: string; status: string; trial_ends_at: string; return_status: string; charge_status: string; charge_attempts: number; last_charge_error: string | null; referral_code: string; created_at: string };

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [trials, setTrials] = useState<AdminTrial[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadTrials(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/trials", { headers: { "x-admin-secret": secret } });
    if (!response.ok) {
      setError("認証に失敗しました。");
      setLoading(false);
      return;
    }
    const data = await response.json();
    setTrials(data.trials);
    setLoading(false);
  }

  return <main className="admin-page"><header className="simple-header"><Link href="/" className="brand">夢重力<span>マクラ</span></Link><Link href="/">トップへ戻る</Link></header><section className="admin-wrap"><p className="eyebrow">OPERATIONS</p><h1>試眠申込<br /><em>管理画面</em></h1><form className="admin-login" onSubmit={loadTrials}><input type="password" value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="ADMIN_SECRET" /><button className="button button-primary" type="submit" disabled={loading}>{loading ? "確認中" : "一覧を見る"}</button></form>{error && <p className="form-error">{error}</p>}{trials.length > 0 && <div className="admin-table"><table><thead><tr><th>申込者</th><th>状態</th><th>試用終了</th><th>返却</th><th>決済</th><th>紹介コード</th></tr></thead><tbody>{trials.map((trial) => <tr key={trial.id}><td>{trial.name}<br />{trial.email}</td><td>{trial.status}</td><td>{new Date(trial.trial_ends_at).toLocaleDateString("ja-JP")}</td><td>{trial.return_status}</td><td>{trial.charge_status}<br />{trial.last_charge_error || ""}</td><td>{trial.referral_code}</td></tr>)}</tbody></table></div>}</section></main>;
}
