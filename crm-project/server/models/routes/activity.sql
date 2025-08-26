CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50),
  title VARCHAR(255),
  notes TEXT,
  outcome VARCHAR(255),
  timestamp VARCHAR(32)
);


