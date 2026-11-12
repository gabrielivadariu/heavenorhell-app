import { randomUUID } from 'node:crypto';

// SQLite triggers check and reserve both limits in the same atomic statement.
// Safe across Worker isolates; settlement is idempotent and failures stay charged
// at the reserved amount when the provider's actual token use is unknown.
export class D1UsageStore {
  constructor(db) { this.db = db; }
  async counts(id) {
    return await this.db.prepare('SELECT god, devil, council, total FROM daily_usage WHERE day = ? AND user_id = ?')
      .bind(new Date().toISOString().slice(0,10), id).first() ?? {god:0,devil:0,council:0,total:0};
  }
  async reserve(id, role, premium, dailyLimit, budget, reserved = 6000) {
    const reservation = {id:randomUUID(), day:new Date().toISOString().slice(0,10)};
    try {
      await this.db.prepare(`INSERT INTO reservations
        (id, day, user_id, role, premium, daily_limit, budget, reserved) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(reservation.id,reservation.day,id,role,Number(premium),dailyLimit,budget,reserved).run();
      return reservation;
    } catch (error) {
      const message = String(error?.message);
      if (message.includes('daily_limit')) return {error:'daily_limit'};
      if (message.includes('capacity')) return {error:'capacity'};
      throw error;
    }
  }
  async settle(reservation, actualTokens, failed = false) {
    await this.db.prepare('UPDATE reservations SET settled = 1, actual = ?, failed = ? WHERE id = ? AND settled = 0')
      .bind(actualTokens ?? null,Number(failed),reservation.id).run();
  }
  async prune() {
    const cutoff = new Date(Date.now()-7*86400000).toISOString().slice(0,10);
    await this.db.batch(['reservations','daily_usage','daily_budget'].map(table=>
      this.db.prepare(`DELETE FROM ${table} WHERE day < ?`).bind(cutoff)));
  }
}
