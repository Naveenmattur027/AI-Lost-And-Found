const fetch = require('node-fetch');

async function testAddItem() {
  try {
    const response = await fetch('http://localhost:5000/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Item',
        category: 'other',
        location: 'Test Location',
        description: 'Test Description',
        dateFound: '2025-11-21'
      }),
    });
    
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAddItem();