const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Simple route
app.get('/', (req, res) => {
  res.json({ message: 'Simple server is running' });
});

// Restaurants route
app.get('/api/restaurants', (req, res) => {
  const restaurants = [
    {
      _id: '1',
      name: 'Test Restaurant 1',
      cuisine: ['Italian', 'Pizza'],
      description: 'A test restaurant'
    },
    {
      _id: '2',
      name: 'Test Restaurant 2',
      cuisine: ['Japanese', 'Sushi'],
      description: 'Another test restaurant'
    }
  ];
  
  res.json({
    success: true,
    count: restaurants.length,
    data: restaurants
  });
});

// Start server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
});