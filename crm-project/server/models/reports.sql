DROP TABLE IF EXISTS reports;
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    originalname VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    year INT,
    metrics VARCHAR(255),
    summary TEXT,
    esg_score INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);