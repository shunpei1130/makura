import {
  REFERRAL_REWARD_DAYS,
  REFERRAL_REWARD_THRESHOLD,
} from "@/lib/constants";
import { getDb } from "@/lib/db";

export async function qualifyReferral(referredTrialId: string) {
  const sql = getDb();
  const referredRows = await sql`
    SELECT referrer_id FROM trials WHERE id = ${referredTrialId} LIMIT 1
  `;
  const referrerId = referredRows[0]?.referrer_id;

  if (!referrerId) {
    return { qualified: false, rewarded: false, count: 0 };
  }

  const inserted = await sql`
    INSERT INTO referrals (referrer_trial_id, referred_trial_id)
    VALUES (${referrerId}, ${referredTrialId})
    ON CONFLICT (referrer_trial_id, referred_trial_id) DO NOTHING
    RETURNING id
  `;

  const countRows = await sql`
    SELECT COUNT(*)::int AS count
    FROM referrals
    WHERE referrer_trial_id = ${referrerId}
  `;
  const count = Number(countRows[0]?.count ?? 0);

  let rewarded = false;
  if (inserted.length > 0 && count >= REFERRAL_REWARD_THRESHOLD) {
    const rewardRows = await sql`
      UPDATE trials
      SET
        trial_ends_at = trial_ends_at + (${REFERRAL_REWARD_DAYS} * INTERVAL '1 day'),
        referral_rewarded_at = now(),
        updated_at = now()
      WHERE id = ${referrerId}
        AND referral_rewarded_at IS NULL
        AND status = 'active'
      RETURNING id
    `;
    rewarded = rewardRows.length > 0;
  }

  return { qualified: inserted.length > 0, rewarded, count };
}

export async function getReferralCount(trialId: string) {
  const sql = getDb();
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM referrals
    WHERE referrer_trial_id = ${trialId}
  `;
  return Number(rows[0]?.count ?? 0);
}
