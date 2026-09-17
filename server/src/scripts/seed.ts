import { prisma } from '../db.js';
import { CampusCryptoService } from '../services/cryptoService.js';

async function main() {
  console.log('🌱 Seeding CampusConnect Database...');

  // 1. Seed Colleges
  const collegesData = [
    {
      name: 'Shri Ram College of Commerce (SRCC)',
      shortCode: 'DU_SRCC',
      domain: 'srcc.du.ac.in',
      city: 'New Delhi',
      state: 'Delhi'
    },
    {
      name: "St. Stephen's College",
      shortCode: 'DU_STEPHENS',
      domain: 'ststephens.edu',
      city: 'New Delhi',
      state: 'Delhi'
    },
    {
      name: 'Hindu College',
      shortCode: 'DU_HINDU',
      domain: 'hinducollege.ac.in',
      city: 'New Delhi',
      state: 'Delhi'
    },
    {
      name: 'Indian Institute of Technology Delhi (IITD)',
      shortCode: 'IIT_DELHI',
      domain: 'iitd.ac.in',
      city: 'New Delhi',
      state: 'Delhi'
    },
    {
      name: 'Indian Institute of Technology Bombay (IITB)',
      shortCode: 'IIT_BOMBAY',
      domain: 'iitb.ac.in',
      city: 'Mumbai',
      state: 'Maharashtra'
    },
    {
      name: 'Birla Institute of Technology and Science, Pilani',
      shortCode: 'BITS_PILANI',
      domain: 'pilani.bits-pilani.ac.in',
      city: 'Pilani',
      state: 'Rajasthan'
    },
    {
      name: 'Delhi Technological University (DTU)',
      shortCode: 'DTU_DELHI',
      domain: 'dtu.ac.in',
      city: 'New Delhi',
      state: 'Delhi'
    },
    {
      name: 'National Institute of Technology, Tiruchirappalli',
      shortCode: 'NIT_TRICHY',
      domain: 'nitt.edu',
      city: 'Tiruchirappalli',
      state: 'Tamil Nadu'
    }
  ];

  for (const c of collegesData) {
    await prisma.college.upsert({
      where: { shortCode: c.shortCode },
      update: {},
      create: c
    });
  }
  console.log(`✅ Seeded ${collegesData.length} Indian colleges.`);

  // 2. Seed Demo Students
  const srcc = await prisma.college.findUnique({ where: { shortCode: 'DU_SRCC' } });
  if (!srcc) throw new Error('SRCC not found');

  const studentA_phone = '+919810123456';
  const studentA_hash = CampusCryptoService.generateIdentityHash(studentA_phone);

  const studentB_phone = '+919876543210';
  const studentB_hash = CampusCryptoService.generateIdentityHash(studentB_phone);

  await prisma.user.upsert({
    where: { identityHash: studentA_hash },
    update: {},
    create: {
      collegeId: srcc.id,
      identityHash: studentA_hash,
      maskedPhone: CampusCryptoService.createMaskedHint(studentA_phone, 'phone'),
      maskedInstagram: '@a***v_srcc',
      verificationStatus: 'VERIFIED',
      crushSlotsTotal: 3,
      crushSlotsUsed: 0
    }
  });

  await prisma.user.upsert({
    where: { identityHash: studentB_hash },
    update: {},
    create: {
      collegeId: srcc.id,
      identityHash: studentB_hash,
      maskedPhone: CampusCryptoService.createMaskedHint(studentB_phone, 'phone'),
      maskedInstagram: '@p***a_srcc',
      verificationStatus: 'VERIFIED',
      crushSlotsTotal: 3,
      crushSlotsUsed: 0
    }
  });

  console.log('✅ Seeded demo students with peppered hashes (Student A & Student B).');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
