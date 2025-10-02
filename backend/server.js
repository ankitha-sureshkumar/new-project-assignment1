require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
app.use('/api/clinic', require('./routes/clinicRoutes')); // ⬅ NEW

// Start server
if (require.main === module) {
    connectDB();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
