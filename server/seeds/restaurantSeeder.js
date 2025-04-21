const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Sample restaurant data
const restaurants = [
  {
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
    }
  },
  {
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
    }
  },
  {
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
    }
  },
  {
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
    }
  },
  {
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
    }
  }
];

// Sample menu items for each restaurant
const menuItemsTemplate = [
  // Italian restaurant menu items
  [
    {
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
      price: 12.99,
      category: 'main course',
      preparationTime: 15,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isAvailable: true
    },
    {
      name: 'Spaghetti Carbonara',
      description: 'Spaghetti with a creamy sauce of eggs, cheese, pancetta, and black pepper',
      price: 14.99,
      category: 'main course',
      preparationTime: 20,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isAvailable: true
    },
    {
      name: 'Caprese Salad',
      description: 'Fresh mozzarella, tomatoes, and basil drizzled with balsamic glaze',
      price: 9.99,
      category: 'appetizer',
      preparationTime: 10,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      isAvailable: true
    },
    {
      name: 'Tiramisu',
      description: 'Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream',
      price: 7.99,
      category: 'dessert',
      preparationTime: 5,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isAvailable: true
    },
    {
      name: 'Italian Soda',
      description: 'Refreshing carbonated beverage with your choice of fruit syrup',
      price: 3.99,
      category: 'beverage',
      preparationTime: 2,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isAvailable: true
    }
  ],
  // Japanese restaurant menu items
  [
    {
      name: 'California Roll',
      description: 'Sushi roll with crab, avocado, and cucumber',
      price: 8.99,
      category: 'appetizer',
      preparationTime: 15,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isAvailable: true
    },
    {
      name: 'Salmon Nigiri (2 pcs)',
      description: 'Fresh salmon over pressed vinegared rice',
      price: 6.99,
      category: 'main course',
      preparationTime: 10,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isAvailable: true
    },
    {
      name: 'Chicken Teriyaki',
      description: 'Grilled chicken glazed with teriyaki sauce, served with rice and vegetables',
      price: 15.99,
      category: 'main course',
      preparationTime: 20,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isAvailable: true
    },
    {
      name: 'Miso Soup',
      description: 'Traditional Japanese soup with tofu, seaweed, and green onions',
      price: 3.99,
      category: 'appetizer',
      preparationTime: 5,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isAvailable: true
    },
    {
      name: 'Green Tea Ice Cream',
      description: 'Creamy matcha-flavored ice cream',
      price: 4.99,
      category: 'dessert',
      preparationTime: 3,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      isAvailable: true
    }
  ],
  // Burger restaurant menu items
  [
    {
      name: 'Classic Cheeseburger',
      description: 'Angus beef patty with cheddar cheese, lettuce, tomato, and special sauce',
      price: 10.99,
      category: 'main course',
      preparationTime: 15,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isAvailable: true
    },
    {
      name: 'Bacon Avocado Burger',
      description: 'Angus beef patty with bacon, avocado, lettuce, and chipotle mayo',
      price: 13.99,
      category: 'main course',
      preparationTime: 15,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isAvailable: true
    },
    {
      name: 'Veggie Burger',
      description: 'Plant-based patty with lettuce, tomato, pickles, and vegan mayo',
      price: 11.99,
      category: 'main course',
      preparationTime: 15,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: false,
      isAvailable: true
    },
    {
      name: 'Loaded Fries',
      description: 'Crispy fries topped with cheese, bacon, sour cream, and green onions',
      price: 7.99,
      category: 'side dish',
      preparationTime: 10,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isAvailable: true
    },
    {
      name: 'Chocolate Milkshake',
      description: 'Thick and creamy shake made with premium chocolate ice cream',
      price: 5.99,
      category: 'beverage',
      preparationTime: 5,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      isAvailable: true
    }
  ],
  // Mexican restaurant menu items
  [
    {
      name: 'Street Tacos (3)',
      description: 'Three corn tortillas with your choice of meat, onions, cilantro, and salsa',
      price: 9.99,
      category: 'main course',
      preparationTime: 12,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isAvailable: true
    },
    {
      name: 'Chicken Quesadilla',
      description: 'Flour tortilla filled with grilled chicken, cheese, and peppers',
      price: 11.99,
      category: 'main course',
      preparationTime: 15,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isAvailable: true
    },
    {
      name: 'Guacamole & Chips',
      description: 'Freshly made guacamole with crispy tortilla chips',
      price: 7.99,
      category: 'appetizer',
      preparationTime: 8,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isAvailable: true
    },
    {
      name: 'Churros',
      description: 'Fried dough pastry dusted with cinnamon sugar, served with chocolate dipping sauce',
      price: 6.99,
      category: 'dessert',
      preparationTime: 10,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isAvailable: true
    },
    {
      name: 'Horchata',
      description: 'Sweet rice milk beverage flavored with cinnamon',
      price: 3.99,
      category: 'beverage',
      preparationTime: 2,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isAvailable: true
    }
  ],
  // Indian restaurant menu items
  [
    {
      name: 'Chicken Tikka Masala',
      description: 'Grilled chicken in a creamy tomato sauce with Indian spices',
      price: 14.99,
      category: 'main course',
      preparationTime: 20,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isAvailable: true
    },
    {
      name: 'Vegetable Biryani',
      description: 'Fragrant basmati rice cooked with mixed vegetables and aromatic spices',
      price: 12.99,
      category: 'main course',
      preparationTime: 25,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isAvailable: true
    },
    {
      name: 'Garlic Naan',
      description: 'Soft flatbread topped with garlic and butter',
      price: 3.99,
      category: 'side dish',
      preparationTime: 8,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isAvailable: true
    },
    {
      name: 'Samosas (2)',
      description: 'Crispy pastries filled with spiced potatoes and peas',
      price: 5.99,
      category: 'appetizer',
      preparationTime: 10,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: false,
      isAvailable: true
    },
    {
      name: 'Mango Lassi',
      description: 'Refreshing yogurt drink blended with mango and a hint of cardamom',
      price: 4.99,
      category: 'beverage',
      preparationTime: 5,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      isAvailable: true
    }
  ]
];

// Create restaurant owners
const restaurantOwners = [
  {
    name: 'Marco Rossi',
    email: 'marco@italianodelizioso.com',
    password: 'password123',
    role: 'restaurant',
    phone: '(212) 555-1234'
  },
  {
    name: 'Yuki Tanaka',
    email: 'yuki@sushimaster.com',
    password: 'password123',
    role: 'restaurant',
    phone: '(415) 555-6789'
  },
  {
    name: 'John Smith',
    email: 'john@burgerhaven.com',
    password: 'password123',
    role: 'restaurant',
    phone: '(312) 555-9012'
  },
  {
    name: 'Maria Garcia',
    email: 'maria@tacofiesta.com',
    password: 'password123',
    role: 'restaurant',
    phone: '(213) 555-3456'
  },
  {
    name: 'Raj Patel',
    email: 'raj@spiceofindia.com',
    password: 'password123',
    role: 'restaurant',
    phone: '(617) 555-7890'
  }
];

// Create admin user
const adminUser = {
  name: 'Admin User',
  email: 'admin@foodpreorder.com',
  password: 'admin123',
  role: 'admin',
  phone: '(555) 123-4567'
};

// Create regular user
const regularUser = {
  name: 'Regular User',
  email: 'user@example.com',
  password: 'user123',
  role: 'user',
  phone: '(555) 987-6543'
};

// Seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await User.deleteMany({});

    console.log('Database cleared');

    // Create admin user
    const hashedAdminPassword = await bcrypt.hash(adminUser.password, 10);
    const adminUserDoc = await User.create({
      ...adminUser,
      password: hashedAdminPassword
    });
    console.log('Admin user created');

    // Create regular user
    const hashedUserPassword = await bcrypt.hash(regularUser.password, 10);
    const regularUserDoc = await User.create({
      ...regularUser,
      password: hashedUserPassword
    });
    console.log('Regular user created');

    // Create restaurant owners and their restaurants
    for (let i = 0; i < restaurantOwners.length; i++) {
      // Create restaurant owner
      const hashedPassword = await bcrypt.hash(restaurantOwners[i].password, 10);
      const ownerDoc = await User.create({
        ...restaurantOwners[i],
        password: hashedPassword
      });
      
      // Create restaurant with owner reference
      const restaurantDoc = await Restaurant.create({
        ...restaurants[i],
        owner: ownerDoc._id
      });
      
      // Create menu items for this restaurant
      const menuItems = menuItemsTemplate[i].map(item => ({
        ...item,
        restaurant: restaurantDoc._id
      }));
      
      await MenuItem.insertMany(menuItems);
      
      console.log(`Created restaurant: ${restaurants[i].name} with ${menuItems.length} menu items`);
    }

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();