CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    total_seats INT NOT NULL
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, user_id)
);

-- Пример события
INSERT INTO events (name, total_seats) VALUES ('Concert', 3) ON CONFLICT DO NOTHING;
