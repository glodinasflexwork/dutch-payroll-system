const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

async function createPointsPackages() {
  const authClient = new PrismaClient({
    datasources: { db: { url: process.env.AUTH_DATABASE_URL } }
  });

  try {
    console.log('🎯 Creating points packages...');

    // Define points packages
    const packages = [
      {
        name: '10 Payroll Credits',
        points: 10,
        price: 3000, // €30.00 (10 × €3.00)
        currency: 'EUR'
      },
      {
        name: '25 Payroll Credits',
        points: 25,
        price: 7125, // €71.25 (25 × €3.00 - 5% discount)
        currency: 'EUR'
      },
      {
        name: '50 Payroll Credits',
        points: 50,
        price: 13500, // €135.00 (50 × €3.00 - 10% discount)
        currency: 'EUR'
      },
      {
        name: '100 Payroll Credits',
        points: 100,
        price: 25500, // €255.00 (100 × €3.00 - 15% discount)
        currency: 'EUR'
      }
    ];

    // Create packages
    for (const pkg of packages) {
      const existingPackage = await authClient.pointsPackage.findFirst({
        where: { name: pkg.name }
      });

      if (existingPackage) {
        console.log(`📦 Updating existing package: ${pkg.name}`);
        await authClient.pointsPackage.update({
          where: { id: existingPackage.id },
          data: pkg
        });
      } else {
        console.log(`📦 Creating new package: ${pkg.name}`);
        await authClient.pointsPackage.create({
          data: pkg
        });
      }
    }

    console.log('✅ Points packages created successfully!');

    // Display created packages
    const allPackages = await authClient.pointsPackage.findMany({
      where: { isActive: true },
      orderBy: { points: 'asc' }
    });

    console.log('\n📋 Available Points Packages:');
    allPackages.forEach(pkg => {
      const pricePerPoint = pkg.price / pkg.points / 100;
      const discount = ((300 - pricePerPoint) / 300 * 100).toFixed(1);
      console.log(`  • ${pkg.name}: ${pkg.points} points for €${(pkg.price / 100).toFixed(2)} (€${pricePerPoint.toFixed(2)}/point, ${discount}% discount)`);
    });

  } catch (error) {
    console.error('❌ Error creating points packages:', error);
  } finally {
    await authClient.$disconnect();
  }
}

createPointsPackages();

