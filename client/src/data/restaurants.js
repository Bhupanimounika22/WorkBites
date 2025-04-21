// Static restaurant data for client-side use
const restaurants = [
  {
    _id: '1',
    name: 'Italiano Delizioso',
    description: 'Authentic Italian cuisine with a modern twist. Our pasta is made fresh daily and our pizzas are baked in a traditional wood-fired oven.',
    cuisine: ['Italian', 'Mediterranean', 'Pizza'],
    address: {
      street: '123 Pasta Lane',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    phone: '(212) 555-1234',
    email: 'info@italianodelizioso.com',
    openingHours: {
      monday: { open: '11:00', close: '22:00' },
      tuesday: { open: '11:00', close: '22:00' },
      wednesday: { open: '11:00', close: '22:00' },
      thursday: { open: '11:00', close: '22:00' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '12:00', close: '23:00' },
      sunday: { open: '12:00', close: '21:00' }
    },
    owner: '101'
  },
  {
    _id: '2',
    name: 'Sushi Master',
    description: 'Premium sushi and Japanese cuisine made with the freshest ingredients. Our chefs have trained in Japan to bring you an authentic experience.',
    cuisine: ['Japanese', 'Sushi', 'Asian'],
    address: {
      street: '456 Wasabi Way',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      country: 'USA'
    },
    phone: '(415) 555-6789',
    email: 'info@sushimaster.com',
    openingHours: {
      monday: { open: '12:00', close: '22:00' },
      tuesday: { open: '12:00', close: '22:00' },
      wednesday: { open: '12:00', close: '22:00' },
      thursday: { open: '12:00', close: '22:00' },
      friday: { open: '12:00', close: '23:00' },
      saturday: { open: '13:00', close: '23:00' },
      sunday: { open: '13:00', close: '21:00' }
    },
    owner: '102'
  },
  {
    _id: '3',
    name: 'Burger Haven',
    description: 'Gourmet burgers made with 100% Angus beef and fresh, locally-sourced ingredients. Try our signature Haven Burger with special sauce!',
    cuisine: ['American', 'Burgers', 'Fast Food'],
    address: {
      street: '789 Patty Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60607',
      country: 'USA'
    },
    phone: '(312) 555-9012',
    email: 'info@burgerhaven.com',
    openingHours: {
      monday: { open: '10:00', close: '22:00' },
      tuesday: { open: '10:00', close: '22:00' },
      wednesday: { open: '10:00', close: '22:00' },
      thursday: { open: '10:00', close: '22:00' },
      friday: { open: '10:00', close: '23:00' },
      saturday: { open: '11:00', close: '23:00' },
      sunday: { open: '11:00', close: '22:00' }
    },
    owner: '103'
  },
  {
    _id: '4',
    name: 'Taco Fiesta',
    description: 'Authentic Mexican street food with a California influence. Our tacos are made with handmade tortillas and slow-cooked meats.',
    cuisine: ['Mexican', 'Latin American', 'Tacos'],
    address: {
      street: '321 Salsa Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90012',
      country: 'USA'
    },
    phone: '(213) 555-3456',
    email: 'info@tacofiesta.com',
    openingHours: {
      monday: { open: '11:00', close: '21:00' },
      tuesday: { open: '11:00', close: '21:00' },
      wednesday: { open: '11:00', close: '21:00' },
      thursday: { open: '11:00', close: '21:00' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '12:00', close: '23:00' },
      sunday: { open: '12:00', close: '21:00' }
    },
    owner: '104'
  },
  {
    _id: '5',
    name: 'Spice of India',
    description: 'Traditional Indian cuisine with a focus on authentic spices and flavors. Our tandoori dishes and curries are customer favorites.',
    cuisine: ['Indian', 'Curry', 'Vegetarian'],
    address: {
      street: '567 Curry Lane',
      city: 'Boston',
      state: 'MA',
      zipCode: '02115',
      country: 'USA'
    },
    phone: '(617) 555-7890',
    email: 'info@spiceofindia.com',
    openingHours: {
      monday: { open: '12:00', close: '22:00' },
      tuesday: { open: '12:00', close: '22:00' },
      wednesday: { open: '12:00', close: '22:00' },
      thursday: { open: '12:00', close: '22:00' },
      friday: { open: '12:00', close: '23:00' },
      saturday: { open: '13:00', close: '23:00' },
      sunday: { open: '13:00', close: '21:00' }
    },
    owner: '105'
  }
];

export default restaurants;