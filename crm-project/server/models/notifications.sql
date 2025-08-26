CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  timestamp VARCHAR(32),
  read BOOLEAN DEFAULT FALSE
);
