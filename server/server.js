const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const { connectDatabase } = require('./database');

const PORT = process.env.PORT || 5000;

connectDatabase()
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`Unable to start server: ${error.message}`);
    process.exit(1);
  });
