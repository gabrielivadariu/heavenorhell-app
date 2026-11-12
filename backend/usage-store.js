import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { dirname } from "node:path";

// A durable single-process ledger. Use a shared database before adding replicas.
export class UsageStore {
  constructor(path) { this.path = path; this.data = { day: "", users: {}, tokens: 0 }; this.queue = Promise.resolve(); }
  async load() {
    if (!this.path) return;
    try { this.data = JSON.parse(await readFile(this.path, "utf8")); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
  }
  today() {
    const day = new Date().toISOString().slice(0, 10);
    if (this.data.day !== day) this.data = { day, users: {}, tokens: 0 };
    return this.data;
  }
  counts(id) { return this.today().users[id] ?? {god:0, devil:0, council:0, total:0}; }
  async canReserve(budget, reserved = 6000) { return this.today().tokens + reserved <= budget; }
  async reserve(id, role, premium, dailyLimit, budget, reserved = 6000) {
    const data = this.today();
    const count = this.counts(id);
    if ((premium ? count.total : count[role]) >= dailyLimit) return { error:"daily_limit" };
    if (data.tokens + reserved > budget) return { error:"capacity" };
    if (!data.users[id] && Object.keys(data.users).length >= 10000) return { error:"capacity" };
    data.users[id] = {...count, [role]:count[role]+1, total:count.total+1};
    data.tokens += reserved;
    const reservation = { day:data.day, id, role, reserved };
    await this.persist();
    return reservation;
  }
  async settle(reservation, actualTokens, failed = false) {
    const data = this.today();
    if (data.day !== reservation.day) return;
    // Keep the full reservation for ambiguous upstream failures: a timeout may still be billed.
    data.tokens = Math.max(0, data.tokens - reservation.reserved + (actualTokens ?? reservation.reserved));
    if (failed) {
      const counts = data.users[reservation.id];
      counts[reservation.role] = Math.max(0,counts[reservation.role]-1);
      counts.total = Math.max(0,counts.total-1);
    }
    await this.persist();
  }
  persist() {
    if (!this.path) return Promise.resolve();
    const snapshot = JSON.stringify(this.data);
    this.queue = this.queue.catch(() => {}).then(async () => {
      await mkdir(dirname(this.path), {recursive:true});
      await writeFile(`${this.path}.next`, snapshot, {mode:0o600});
      await rename(`${this.path}.next`, this.path);
    });
    return this.queue;
  }
}
