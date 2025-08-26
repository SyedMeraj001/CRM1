CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  metric VARCHAR(100),
  value NUMERIC,
  period VARCHAR(32)
);