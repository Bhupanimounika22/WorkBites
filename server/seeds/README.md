# Database Seeder

This directory contains scripts to seed the database with sample data for development and testing purposes.

## Available Seeders

### Restaurant Seeder

The `restaurantSeeder.js` script populates the database with:

- 5 sample restaurants with different cuisines
- 5 menu items for each restaurant
- 5 restaurant owner accounts (one for each restaurant)
- 1 admin user account
- 1 regular customer account

## Running the Seeders

To run the restaurant seeder:

```bash
npm run seed
```

This will:
1. Clear all existing data in the Users, Restaurants, and MenuItems collections
2. Create all the sample data

## Sample User Accounts

After running the seeder, you can log in with the following accounts:

### Admin User
- Email: admin@foodpreorder.com
- Password: admin123

### Regular User
- Email: user@example.com
- Password: user123

### Restaurant Owners
1. Italian Restaurant Owner
   - Email: marco@italianodelizioso.com
   - Password: password123

2. Japanese Restaurant Owner
   - Email: yuki@sushimaster.com
   - Password: password123

3. Burger Restaurant Owner
   - Email: john@burgerhaven.com
   - Password: password123

4. Mexican Restaurant Owner
   - Email: maria@tacofiesta.com
   - Password: password123

5. Indian Restaurant Owner
   - Email: raj@spiceofindia.com
   - Password: password123

## Note

Make sure your MongoDB server is running before executing the seeder script.