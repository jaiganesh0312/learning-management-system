const { Role } = require('../models');
const { ROLES } = require('../constants/roles');

/**
 * Seed default LMS roles with their permissions
 * This script is idempotent - safe to run multiple times
 */
async function seedRoles() {
  try {
    console.log('Starting role seeding...');

    const rolesToCreate = Object.values(ROLES);

    for (const roleData of rolesToCreate) {
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: {
          name: roleData.name,
          displayName: roleData.displayName,
          description: roleData.description,
          permissions: roleData.permissions,
          isActive: true,
        },
      });

      if (created) {
        console.log(`✓ Created role: ${roleData.displayName} (${roleData.name})`);
      } else {
        // Update existing role's permissions
        await role.update({
          displayName: roleData.displayName,
          description: roleData.description,
          permissions: roleData.permissions,
          isActive: true,
        });
        console.log(`✓ Updated role: ${roleData.displayName} (${roleData.name})`);
      }
    }

    console.log('\n✅ Role seeding completed successfully!');
    console.log(`Total roles: ${rolesToCreate.length}`);
    
    // Display all roles
    const allRoles = await Role.findAll();
    console.log('\nCurrent roles in database:');
    allRoles.forEach(role => {
      console.log(`  - ${role.displayName} (${role.name}): ${role.permissions.length} permissions`);
    });

  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  const { sequelize } = require('../models');
  
  seedRoles()
    .then(() => {
      console.log('\nClosing database connection...');
      return sequelize.close();
    })
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedRoles;
