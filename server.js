// server.js
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/bookings/reserve", async (req, res) => {
	const { event_id, user_id } = req.body;

	if (!event_id || !user_id) {
		return res.status(400).json({ error: "event_id and user_id are required" });
	}

	try {
		// Проверка существования события
		const event = await db.query("SELECT total_seats FROM events WHERE id = $1", [event_id]);
		if (event.rows.length === 0) {
			return res.status(404).json({ error: "Event not found" });
		}
		const totalSeats = event.rows[0].total_seats;

		// Проверка количества забронированных мест
		const { count } = await db.query("SELECT COUNT(*) FROM bookings WHERE event_id = $1", [event_id]).then((r) => r.rows[0]);

		if (count >= totalSeats) {
			return res.status(400).json({ error: "No available seats" });
		}

		// Попытка забронировать (защита от дублей — через UNIQUE)
		await db.query("INSERT INTO bookings (event_id, user_id, created_at) VALUES ($1, $2, NOW())", [event_id, user_id]);

		res.status(201).json({ message: "Seat successfully reserved" });
	} catch (err) {
		if (err.code === "23505") {
			// unique_violation
			return res.status(400).json({ error: "User has already booked a seat for this event" });
		}
		console.error(err);
		res.status(500).json({ error: "Internal server error" });
	}
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
