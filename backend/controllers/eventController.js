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

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};