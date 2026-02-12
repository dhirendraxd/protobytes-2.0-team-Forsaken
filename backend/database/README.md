# Database Folder Structure

This folder is dedicated to database-related code, schemas, and migrations.

## Folder Organization

### `/schemas`
Database schemas and models for your chosen database.

Examples when you add a database:
- `alerts.schema.js` - Alert model schema
- `contributors.schema.js` - Contributor model schema
- `moderators.schema.js` - Moderator model schema
- `marketPrices.schema.js` - Market price model schema
- `transport.schema.js` - Transport schedule model schema
- `users.schema.js` - User model schema

### `/migrations`
Database migration files for schema updates and data transformations.

Examples:
- `001_initial_setup.js` - Initial database setup
- `002_add_user_roles.js` - Add user roles support
- `003_create_indexes.js` - Create database indexes

## Database Setup Instructions

When you're ready to set up a database, follow these steps:

1. **Choose Your Database**
   - MongoDB (NoSQL)
   - PostgreSQL (SQL)
   - Firebase Firestore (Managed)
   - MySQL
   - Others

2. **Install Database Driver**
   ```bash
   npm install mongodb  # or your chosen database driver
   ```

3. **Create Connection Config**
   Create `config.js` in this directory for database connection settings

4. **Define Schemas**
   Create model files in `/schemas` folder

5. **Run Migrations**
   Set up migration system for managing database changes

6. **Update Backend Routes**
   Replace Firestore/mock calls in `/backend/routes` with actual database queries

## Example: Adding MongoDB

When ready, you would:

1. Create `/database/config.js` with MongoDB connection
2. Create schema files in `/database/schemas/`
3. Update routes to use MongoDB models instead of Firestore
4. Create migrations as needed

The backend structure is already designed to work seamlessly with any database!
