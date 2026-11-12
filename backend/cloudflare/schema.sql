-- No conversation text or provider credentials are stored here.
CREATE TABLE IF NOT EXISTS daily_budget (
  day TEXT PRIMARY KEY, tokens INTEGER NOT NULL DEFAULT 0, users INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS daily_usage (
  day TEXT NOT NULL, user_id TEXT NOT NULL,
  god INTEGER NOT NULL DEFAULT 0, devil INTEGER NOT NULL DEFAULT 0,
  council INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, user_id)
);
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY, day TEXT NOT NULL, user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('god','devil','council')),
  premium INTEGER NOT NULL, daily_limit INTEGER NOT NULL,
  budget INTEGER NOT NULL, reserved INTEGER NOT NULL,
  actual INTEGER, failed INTEGER NOT NULL DEFAULT 0, settled INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS reservations_day ON reservations(day);
CREATE TRIGGER IF NOT EXISTS reserve_limits BEFORE INSERT ON reservations BEGIN
  SELECT RAISE(ABORT, 'daily_limit') WHERE COALESCE((
    SELECT CASE WHEN NEW.premium = 1 THEN total
      WHEN NEW.role = 'god' THEN god WHEN NEW.role = 'devil' THEN devil ELSE council END
    FROM daily_usage WHERE day = NEW.day AND user_id = NEW.user_id
  ), 0) >= NEW.daily_limit;
  SELECT RAISE(ABORT, 'capacity') WHERE COALESCE((
    SELECT tokens FROM daily_budget WHERE day = NEW.day
  ), 0) + NEW.reserved > NEW.budget;
  SELECT RAISE(ABORT, 'capacity') WHERE
    COALESCE((SELECT users FROM daily_budget WHERE day = NEW.day), 0) >= 10000
    AND NOT EXISTS (SELECT 1 FROM daily_usage WHERE day = NEW.day AND user_id = NEW.user_id);
END;
CREATE TRIGGER IF NOT EXISTS reserve_apply AFTER INSERT ON reservations BEGIN
  INSERT INTO daily_budget(day, tokens, users)
    VALUES(NEW.day, NEW.reserved, CASE WHEN EXISTS (
      SELECT 1 FROM daily_usage WHERE day = NEW.day AND user_id = NEW.user_id
    ) THEN 0 ELSE 1 END)
    ON CONFLICT(day) DO UPDATE SET tokens = tokens + excluded.tokens, users = users + excluded.users;
  INSERT INTO daily_usage(day, user_id, god, devil, council, total)
    VALUES(NEW.day, NEW.user_id, NEW.role = 'god', NEW.role = 'devil', NEW.role = 'council', 1)
    ON CONFLICT(day, user_id) DO UPDATE SET
      god = god + excluded.god, devil = devil + excluded.devil,
      council = council + excluded.council, total = total + 1;
END;
CREATE TRIGGER IF NOT EXISTS settle_apply AFTER UPDATE OF settled ON reservations
WHEN OLD.settled = 0 AND NEW.settled = 1 BEGIN
  UPDATE daily_budget SET tokens = MAX(0, tokens - NEW.reserved + COALESCE(NEW.actual, NEW.reserved))
    WHERE day = NEW.day;
  UPDATE daily_usage SET
    god = MAX(0, god - (NEW.failed = 1 AND NEW.role = 'god')),
    devil = MAX(0, devil - (NEW.failed = 1 AND NEW.role = 'devil')),
    council = MAX(0, council - (NEW.failed = 1 AND NEW.role = 'council')),
    total = MAX(0, total - NEW.failed)
    WHERE day = NEW.day AND user_id = NEW.user_id;
END;
