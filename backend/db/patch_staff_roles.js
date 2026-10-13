const pool = require('../config/db');

async function patchStaffRoles() {
  try {
    console.log('Standardizing staff sub_roles in DB...');
    // Ensure column exists
    try {
      await pool.query("ALTER TABLE users ADD COLUMN sub_role VARCHAR(50) NULL DEFAULT NULL AFTER role");
    } catch (e) {
      // Column already exists
    }

    const [res] = await pool.query(`
      UPDATE users 
      SET sub_role = CASE 
        WHEN sub_role IN ('junior_manager', 'senior_manager') THEN 'senior_manager'
        ELSE 'admin_staff'
      END 
      WHERE role = 'staff'
    `);
    console.log('Staff sub-roles updated successfully:', res.message || res);
    const [staffUsers] = await pool.query("SELECT id, email, role, sub_role FROM users WHERE role = 'staff'");
    console.log('Current staff accounts in DB:', staffUsers);
    process.exit(0);
  } catch (err) {
    console.error('Error updating staff sub-roles:', err);
    process.exit(1);
  }
}

patchStaffRoles();
