// controllers/eventController.js
const Event = require('../models/Event');

exports.createEvent = async (req, res) => {
  try {
    const { person, start, end } = req.body;
    const event = new Event({
      person: req.body.person,
      start: req.body.start,
      end: req.body.end,
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event. EventController.', error: error.message });
  }
};

// DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { person, start, end } = req.body;

  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.person = person || event.person;
    event.start = start || event.start;
    event.end = end || event.end;
    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
};