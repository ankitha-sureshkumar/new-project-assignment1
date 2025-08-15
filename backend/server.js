// require('dotenv').config(); 

// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const connectDB = require('./config/db');

// //dotenv.config();


// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/pets', require('./routes/petRoutes'));

// //app.use('/api/tasks', require('./routes/taskRoutes'));

// // Export the app object for testing
// if (require.main === module) {
//     connectDB();
//     // If the file is run directly, start the server
//     const PORT = process.env.PORT || 5001;
//     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//   }


// module.exports = app
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
