const axios = require('axios');

const testServer = async () => {
  try {
    console.log('Testing root endpoint...');
    const rootResponse = await axios.get('http://127.0.0.1:5000/');
    console.log('Root endpoint response:', rootResponse.status, rootResponse.data);
    
    console.log('\nTesting restaurants endpoint...');
    const response = await axios.get('http://127.0.0.1:5000/api/restaurants', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Server response status:', response.status);
    console.log('Server response data:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Server Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received. Is the server running?');
    } else {
      console.error('Error details:', error);
    }
    return null;
  }
};

testServer();