CREATE TABLE compliances (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  status VARCHAR(50),
  due_date DATE,
  notes TEXT
);