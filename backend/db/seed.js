const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runSeed() {
  console.log('Starting migration and seeding...');
  
  // Retrieve environment variables
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || 'Shashini1223@';
  const dbPort = process.env.DB_PORT || 3306;
  const dbName = process.env.DB_NAME || 'apartment_management_system';

  let connection;
  try {
    // 1. Connect without database name first to create it
    console.log(`Connecting to MySQL server at ${dbHost}:${dbPort} as ${dbUser}...`);
    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      port: dbPort
    });

    console.log(`Creating database '${dbName}' if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();

    // 2. Connect to the created database to run migrations and seeds
    console.log(`Connecting to database '${dbName}'...`);
    const pool = mysql.createPool({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      port: dbPort,
      waitForConnections: true,
      connectionLimit: 5
    });

    // 3. Read and execute migration.sql
    const migrationPath = path.join(__dirname, 'migration.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL by semi-colon (ignoring comments/empty lines) and execute individually
    const queries = migrationSql
      .split(/;\s*$/m)
      .map(query => query.trim())
      .filter(query => query.length > 0);

    console.log(`Executing ${queries.length} database setup queries...`);
    for (const query of queries) {
      await pool.query(query);
    }
    console.log('Database tables created successfully.');

    // 4. Insert Seed Users
    const users = [
      { email: 'admin@apartment.com', password: 'AdminPass123!', role: 'admin', status: 'approved' },
      { email: 'staff@apartment.com', password: 'StaffPass123!', role: 'staff', status: 'approved' },
      { email: 'maintenance@apartment.com', password: 'MaintenancePass123!', role: 'maintenance', status: 'approved' },
      { email: 'homeowner@apartment.com', password: 'OwnerPass123!', role: 'homeowner', status: 'approved' }
    ];

    console.log('Inserting seed users...');
    const insertedUsers = {};
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(user.password, salt);
      
      const [result] = await pool.query(
        'INSERT INTO users (email, password_hash, role, status, owner_approved) VALUES (?, ?, ?, ?, ?)',
        [user.email, hash, user.role, user.status, 1]
      );
      insertedUsers[user.role] = result.insertId;
      console.log(`Created seed user: ${user.email} (${user.role})`);
    }

    // 5. Insert Seed Parking Slots
    console.log('Inserting seed parking slots...');
    const parkingSlots = [
      { slot_number: 'P-101', type: 'permanent', status: 'active' },
      { slot_number: 'P-102', type: 'permanent', status: 'active' },
      { slot_number: 'P-201', type: 'permanent', status: 'active' },
      { slot_number: 'P-202', type: 'permanent', status: 'active' },
      { slot_number: 'G-101', type: 'guest', status: 'approved' },
      { slot_number: 'G-102', type: 'guest', status: 'approved' }
    ];

    const slotIds = {};
    for (const slot of parkingSlots) {
      const [result] = await pool.query(
        'INSERT INTO parking_management (slot_number, type, status) VALUES (?, ?, ?)',
        [slot.slot_number, slot.type, slot.status]
      );
      slotIds[slot.slot_number] = result.insertId;
    }
    console.log('Parking slots created.');

    // 6. Insert Seed Units
    console.log('Inserting seed units...');
    const units = [
      { block_name: 'Block A', floor_number: 1, unit_number: '101', owner_id: insertedUsers['homeowner'], parking_slot_id: slotIds['P-101'] },
      { block_name: 'Block A', floor_number: 1, unit_number: '102', owner_id: null, parking_slot_id: slotIds['P-102'] },
      { block_name: 'Block B', floor_number: 2, unit_number: '201', owner_id: null, parking_slot_id: slotIds['P-201'] },
      { block_name: 'Block B', floor_number: 2, unit_number: '202', owner_id: null, parking_slot_id: slotIds['P-202'] }
    ];

    for (const unit of units) {
      const [result] = await pool.query(
        'INSERT INTO units (block_name, floor_number, unit_number, owner_id, parking_slot_id) VALUES (?, ?, ?, ?, ?)',
        [unit.block_name, unit.floor_number, unit.unit_number, unit.owner_id, unit.parking_slot_id]
      );
      
      // Update parking_management to point back to the unit to complete the bidirectional link
      if (unit.parking_slot_id) {
        await pool.query(
          'UPDATE parking_management SET unit_id = ? WHERE id = ?',
          [result.insertId, unit.parking_slot_id]
        );
      }
    }
    console.log('Units created.');

    console.log('Database migration and seeding completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration/Seeding failed:', error);
    if (connection) {
      try { await connection.end(); } catch (err) {}
    }
    process.exit(1);
  }
}

runSeed();
