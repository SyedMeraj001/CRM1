CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  stage VARCHAR(50),
  value NUMERIC,
  contact VARCHAR(255),
  notes TEXT
);