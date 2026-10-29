/**
 * Demo seed data for the Medical Clinic Management System.
 *
 * Creates a realistic, presentation-sized dataset:
 *   - 12 specialties, 10 rooms, 4 roles
 *   - 2 admins, 4 receptionists, 16 doctors, 60 patients
 *   - 2–3 weekly schedules per doctor
 *   - ~400 appointments across the last 30 / next 14 days
 *   - medical records for completed visits
 *
 * Run with: npm run seed
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

const today = new Date();
const dateOnly = (offsetDays = 0) =>
  // Build in UTC so Prisma's @db.Date does not shift the date by the server TZ.
  new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + offsetDays)
  );
const timeOnly = (hour, minute = 0) =>
  new Date(Date.UTC(1970, 0, 1, hour, minute, 0));

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const todayName = DAY_NAMES[today.getDay()];

const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Neurology',
  'Ophthalmology',
  'ENT',
  'Internal Medicine',
  'Gastroenterology',
  'Endocrinology',
  'Pulmonology',
  'Urology',
];

const ROOMS = [
  'Room 101',
  'Room 102',
  'Room 103',
  'Room 201',
  'Room 202',
  'Room 203',
  'Room 301',
  'Room 302',
  'Room 303',
  'Room 304',
];

const MALE_NAMES = [
  'Ahmed', 'Mohamed', 'Omar', 'Ali', 'Hassan', 'Youssef', 'Karim', 'Tarek',
  'Mahmoud', 'Mostafa', 'Amr', 'Khaled', 'Sherif', 'Hany', 'Adel', 'Ziad',
  'Fady', 'Mina', 'Bassem', 'Nader',
];
const FEMALE_NAMES = [
  'Mariam', 'Sara', 'Nour', 'Salma', 'Yasmin', 'Dina', 'Fatma', 'Hana',
  'Laila', 'Mona', 'Aya', 'Rana', 'Heba', 'Nada', 'Farida', 'Amina',
  'Dalia', 'Reem', 'Ghada', 'Shaimaa',
];
const LAST_NAMES = [
  'Hassan', 'Ali', 'Ibrahim', 'Mahmoud', 'El-Sayed', 'Mostafa', 'Fathy',
  'Samir', 'Adel', 'Khaled', 'Tarek', 'Nabil', 'Fouad', 'Amr', 'Zaki',
  'Rashad', 'Salem', 'Farouk', 'Hegazy', 'Mansour',
];

const DOCTOR_SEEDS = [
  ['doctor@clinic.com', 'Dr. Omar Khaled', 'Male', 0, 350, 250, 'Consultant cardiologist with 12 years of experience in preventive cardiology and echocardiography.'],
  ['sara.derm@clinic.com', 'Dr. Sara Mostafa', 'Female', 1, 300, 200, 'Dermatologist specializing in cosmetic dermatology, acne treatment and laser therapy.'],
  ['youssef.ped@clinic.com', 'Dr. Youssef Adel', 'Male', 2, 250, 180, 'Pediatrician focused on child growth, nutrition and childhood respiratory diseases.'],
  ['nour.ortho@clinic.com', 'Dr. Nour El-Sayed', 'Female', 3, 400, 300, 'Orthopedic surgeon specialized in sports injuries and joint replacement.'],
  ['karim.neuro@clinic.com', 'Dr. Karim Fathy', 'Male', 4, 450, 350, 'Neurologist with a special interest in migraine, epilepsy and movement disorders.'],
  ['hana.eye@clinic.com', 'Dr. Hana Samir', 'Female', 5, 300, 220, 'Ophthalmologist experienced in cataract surgery and pediatric eye care.'],
  ['tarek.ent@clinic.com', 'Dr. Tarek Mahmoud', 'Male', 6, 280, 200, 'ENT specialist treating sinusitis, hearing loss and pediatric ENT conditions.'],
  ['laila.internal@clinic.com', 'Dr. Laila Ibrahim', 'Female', 7, 320, 240, 'Internal medicine consultant focusing on diabetes, hypertension and preventive care.'],
  ['hazem.gastro@clinic.com', 'Dr. Hazem Zaki', 'Male', 8, 380, 280, 'Gastroenterologist with expertise in endoscopy and inflammatory bowel disease.'],
  ['maha.endo@clinic.com', 'Dr. Maha Fouad', 'Female', 9, 360, 260, 'Endocrinologist treating thyroid disorders, diabetes and hormonal imbalance.'],
  ['adel.chest@clinic.com', 'Dr. Adel Rashad', 'Male', 10, 340, 240, 'Pulmonologist specialized in asthma, COPD and sleep-related breathing disorders.'],
  ['rania.uro@clinic.com', 'Dr. Rania Salem', 'Female', 11, 390, 290, 'Urologist with a focus on minimally invasive surgery and urinary stones.'],
  ['mahmoud.cardio@clinic.com', 'Dr. Mahmoud Hegazy', 'Male', 0, 330, 230, 'Interventional cardiologist performing cardiac catheterization and stent placement.'],
  ['dina.derm@clinic.com', 'Dr. Dina Farouk', 'Female', 1, 310, 210, 'Dermatologist focused on pediatric skin conditions and hair disorders.'],
  ['shady.ped@clinic.com', 'Dr. Shady Mansour', 'Male', 2, 260, 190, 'Pediatrician with a special interest in neonatology and childhood allergies.'],
  ['ghada.ortho@clinic.com', 'Dr. Ghada Nabil', 'Female', 3, 410, 310, 'Orthopedic consultant treating osteoporosis, fractures and knee disorders.'],
];

const DIAGNOSES = [
  ['Seasonal influenza', 'Oseltamivir 75mg twice daily for 5 days', 'Rest and increase fluid intake.'],
  ['Essential hypertension', 'Amlodipine 5mg once daily', 'Reduce salt intake and monitor blood pressure weekly.'],
  ['Iron deficiency anemia', 'Ferrous sulfate 200mg once daily', 'Recheck CBC after 6 weeks.'],
  ['Migraine without aura', 'Sumatriptan 50mg as needed', 'Keep a headache diary and avoid triggers.'],
  ['Acute pharyngitis', 'Amoxicillin 500mg three times daily for 7 days', 'Warm fluids and gargle with salt water.'],
  ['Type 2 diabetes mellitus', 'Metformin 850mg twice daily', 'Check fasting glucose every morning for two weeks.'],
  ['Gastroesophageal reflux', 'Omeprazole 20mg once daily', 'Avoid late meals and spicy food.'],
  ['Allergic rhinitis', 'Cetirizine 10mg once daily', 'Avoid dust and keep windows closed during pollen season.'],
  ['Low back pain', 'Diclofenac 50mg twice daily as needed', 'Start physiotherapy twice per week.'],
  ['Vitamin D deficiency', 'Cholecalciferol 50,000 IU weekly for 8 weeks', 'Repeat vitamin D level after 8 weeks.'],
  ['Acute otitis media', 'Amoxicillin-clavulanate 625mg twice daily for 7 days', 'Follow up if fever persists after 48 hours.'],
  ['Urinary tract infection', 'Nitrofurantoin 100mg twice daily for 5 days', 'Increase water intake and repeat urine culture if symptoms persist.'],
];

async function createUser({ email, passwordHash, fullName, phone, gender, roleId }) {
  return prisma.user.create({
    data: {
      email,
      passwordHash,
      active: 'Yes',
      person: {
        create: { fullName, phoneNumber: phone, roleId, gender },
      },
    },
    include: { person: true },
  });
}

function buildPatientSeed(index) {
  const isMale = index % 2 === 0;
  const first = isMale
    ? MALE_NAMES[index % MALE_NAMES.length]
    : FEMALE_NAMES[index % FEMALE_NAMES.length];
  const last = LAST_NAMES[(index * 3) % LAST_NAMES.length];
  return {
    email: index === 0 ? 'patient@clinic.com' : `patient${index + 1}@clinic.com`,
    fullName: `${first} ${last}`,
    gender: isMale ? 'Male' : 'Female',
    yearOfBirth: 1958 + ((index * 7) % 45),
    phone: `0120000${String(index + 1).padStart(4, '0')}`,
  };
}

async function main() {
  console.log('Clearing existing data...');
  await prisma.medicalRecord.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctorSchedule.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.oTPVerification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.person.deleteMany();
  await prisma.room.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.role.deleteMany();

  console.log('Seeding roles, specialties and rooms...');
  const roles = ['Doctor', 'Patient', 'Admin', 'Receptionist'];
  for (let i = 0; i < roles.length; i += 1) {
    await prisma.role.create({ data: { id: i + 1, roleName: roles[i] } });
  }

  const specialties = [];
  for (const name of SPECIALTIES) {
    specialties.push(await prisma.specialty.create({ data: { name } }));
  }

  const rooms = [];
  for (const roomName of ROOMS) {
    rooms.push(await prisma.room.create({ data: { roomName } }));
  }

  console.log('Seeding admins and receptionists...');
  const passwordHashes = {
    admin: await bcrypt.hash('Admin@123', SALT_ROUNDS),
    doctor: await bcrypt.hash('Doctor@123', SALT_ROUNDS),
    patient: await bcrypt.hash('Patient@123', SALT_ROUNDS),
    reception: await bcrypt.hash('Reception@123', SALT_ROUNDS),
  };

  await createUser({
    email: 'admin@clinic.com',
    passwordHash: passwordHashes.admin,
    fullName: 'Ahmed Hassan',
    phone: '01000000001',
    gender: 'Male',
    roleId: 3,
  });
  await createUser({
    email: 'admin2@clinic.com',
    passwordHash: passwordHashes.admin,
    fullName: 'Nadia Kamal',
    phone: '01000000009',
    gender: 'Female',
    roleId: 3,
  });

  const receptionists = [
    ['reception@clinic.com', 'Mona Adel', 'Female'],
    ['reception2@clinic.com', 'Hossam Nabil', 'Male'],
    ['reception3@clinic.com', 'Rania Tarek', 'Female'],
    ['reception4@clinic.com', 'Yara Fathy', 'Female'],
  ];
  for (let i = 0; i < receptionists.length; i += 1) {
    const [email, fullName, gender] = receptionists[i];
    await createUser({
      email,
      passwordHash: passwordHashes.reception,
      fullName,
      phone: `0100000${String(i + 10).padStart(4, '0')}`,
      gender,
      roleId: 4,
    });
  }

  console.log('Seeding doctors...');
  const doctors = [];
  for (let i = 0; i < DOCTOR_SEEDS.length; i += 1) {
    const [email, fullName, gender, specialtyIndex, examFee, consultFee, biography] =
      DOCTOR_SEEDS[i];
    const user = await createUser({
      email,
      passwordHash: passwordHashes.doctor,
      fullName,
      phone: `0110000${String(i + 1).padStart(4, '0')}`,
      gender,
      roleId: 1,
    });
    const doctor = await prisma.doctor.create({
      data: {
        userId: user.userId,
        specialtyId: specialties[specialtyIndex].id,
        examinationFee: examFee,
        consultationFee: consultFee,
        biography,
      },
      include: { person: true },
    });
    doctors.push(doctor);
  }

  console.log('Seeding patients...');
  const patients = [];
  for (let i = 0; i < 60; i += 1) {
    const seed = buildPatientSeed(i);
    const user = await createUser({
      email: seed.email,
      passwordHash: passwordHashes.patient,
      fullName: seed.fullName,
      phone: seed.phone,
      gender: seed.gender,
      roleId: 2,
    });
    const patient = await prisma.patient.create({
      data: { userId: user.userId, yearOfBirth: seed.yearOfBirth },
      include: { person: true },
    });
    patients.push(patient);
  }

  console.log('Seeding schedules...');
  const scheduleRows = [];
  for (let i = 0; i < doctors.length; i += 1) {
    const days = new Set([
      DAY_NAMES[(i * 2) % 7],
      DAY_NAMES[(i * 2 + 2) % 7],
    ]);
    // Make sure the demo doctor works today, so the doctor dashboard has a queue.
    if (i === 0) days.add(todayName);
    if (i % 3 === 0) days.add(DAY_NAMES[(i * 2 + 4) % 7]);

    let slot = 0;
    for (const day of days) {
      scheduleRows.push({
        doctorId: doctors[i].id,
        weekDay: day,
        roomId: rooms[(i + slot) % rooms.length].id,
        startTime: timeOnly(9 + slot * 4),
        endTime: timeOnly(12 + slot * 4),
        maxCapacity: 8 + (i % 3) * 2,
      });
      slot += 1;
    }
  }
  const schedules = await prisma.doctorSchedule.createManyAndReturn({
    data: scheduleRows,
  });

  console.log('Seeding appointments...');
  const appointments = [];
  const todayIndex = DAY_NAMES.indexOf(todayName);

  for (let offset = -30; offset <= 14; offset += 1) {
    const date = dateOnly(offset);
    const dayName = DAY_NAMES[(todayIndex + offset + 700) % 7];
    const daySchedules = schedules.filter((s) => s.weekDay === dayName);

    daySchedules.forEach((schedule, scheduleIndex) => {
      const count = 1 + ((offset + 31 + scheduleIndex) % 3);
      for (let k = 0; k < count; k += 1) {
        const patient =
          patients[(Math.abs(offset) * 7 + scheduleIndex * 3 + k) % patients.length];
        let status;
        if (offset < 0) {
          status = (offset + scheduleIndex + k) % 7 === 0 ? 'Canceled' : 'Completed';
        } else if (offset === 0) {
          status = (scheduleIndex + k) % 3 === 0 ? 'Pending' : 'Confirmed';
        } else {
          const marker = (offset + scheduleIndex + k) % 9;
          status = marker === 0 ? 'Canceled' : marker % 2 === 0 ? 'Confirmed' : 'Pending';
        }
        appointments.push({
          patientId: patient.id,
          scheduleId: schedule.id,
          doctorId: schedule.doctorId,
          appointmentType:
            (offset + scheduleIndex + k) % 2 === 0 ? 'Examination' : 'Consultation',
          status,
          appointmentDate: date,
        });
      }
    });
  }

  // Give the demo doctor a busy queue today.
  const demoDoctorToday = schedules.find(
    (s) => s.doctorId === doctors[0].id && s.weekDay === todayName
  );
  for (let i = 0; i < 5; i += 1) {
    appointments.push({
      patientId: patients[(i + 3) % patients.length].id,
      scheduleId: demoDoctorToday.id,
      doctorId: doctors[0].id,
      appointmentType: i % 2 === 0 ? 'Examination' : 'Consultation',
      status: i % 3 === 0 ? 'Pending' : 'Confirmed',
      appointmentDate: dateOnly(0),
    });
  }

  // Give the demo patient a few clear upcoming and past visits.
  const upcomingSeeds = [
    { doctorIndex: 0, offset: 1, status: 'Confirmed' },
    { doctorIndex: 3, offset: 4, status: 'Pending' },
    { doctorIndex: 5, offset: 8, status: 'Confirmed' },
    { doctorIndex: 8, offset: 12, status: 'Pending' },
  ];
  for (const item of upcomingSeeds) {
    const doctor = doctors[item.doctorIndex];
    const schedule = schedules.find((s) => s.doctorId === doctor.id);
    appointments.push({
      patientId: patients[0].id,
      scheduleId: schedule.id,
      doctorId: doctor.id,
      appointmentType: 'Consultation',
      status: item.status,
      appointmentDate: dateOnly(item.offset),
    });
  }
  const pastSeeds = [
    { doctorIndex: 1, offset: -4 },
    { doctorIndex: 4, offset: -11 },
    { doctorIndex: 7, offset: -19 },
  ];
  for (const item of pastSeeds) {
    const doctor = doctors[item.doctorIndex];
    const schedule = schedules.find((s) => s.doctorId === doctor.id);
    appointments.push({
      patientId: patients[0].id,
      scheduleId: schedule.id,
      doctorId: doctor.id,
      appointmentType: 'Examination',
      status: 'Completed',
      appointmentDate: dateOnly(item.offset),
    });
  }

  await prisma.appointment.createMany({ data: appointments });

  console.log('Seeding medical records...');
  const completed = await prisma.appointment.findMany({
    where: { status: 'Completed' },
    select: { id: true },
  });
  const records = completed.map((appointment, index) => {
    const [diagnosis, prescription, notes] = DIAGNOSES[index % DIAGNOSES.length];
    return { appointmentId: appointment.id, diagnosis, prescription, notes };
  });
  await prisma.medicalRecord.createMany({ data: records });

  const counts = {
    users: await prisma.user.count(),
    doctors: await prisma.doctor.count(),
    patients: await prisma.patient.count(),
    schedules: await prisma.doctorSchedule.count(),
    appointments: await prisma.appointment.count(),
    records: await prisma.medicalRecord.count(),
  };
  console.log('Seed complete:', counts);
  console.log('\nDemo accounts (password in parentheses):');
  console.log('  Admin:        admin@clinic.com (Admin@123)');
  console.log('  Doctor:       doctor@clinic.com (Doctor@123)');
  console.log('  Patient:      patient@clinic.com (Patient@123)');
  console.log('  Receptionist: reception@clinic.com (Reception@123)');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
