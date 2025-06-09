import express from 'express';
import { updateServicePrices } from './update-service-prices'; // Adjust the path based on your project structure

const app = express();
const port = 5000;

// Other middleware and route definitions can go here...

// Start the server
app.listen(port, '0.0.0.0', async () => {
  console.log(`🚀 Server running on http://0.0.0.0:${port}`);
  
  // Automatically update service prices
  try {
    await updateServicePrices();
  } catch (error) {
    console.error('Error during automatic service price update:', error);
  }
});
