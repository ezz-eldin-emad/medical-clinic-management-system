/**
 * Demo seed data for the Medical Clinic Management System.
 * Run with: npm run seed
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

const today = new Date();
const dateOnly = (offsetDays = 0) => {
  // Build the date in UTC so Prisma's @db.Date does not shift it by the
  // server timezone (local midnight in EET is the previous day in UTC).
  return new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + offsetDays)
  );
};
const timeOnly = (hour, minute = 0) =>
  new Date(Date.UTC(1970, 0, 1, hour, minute, 0));

async function createUser({ email, password, fullName, phone, gender, roleId }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
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

  console.log('Seeding roles...');
  const roles = ['Doctor', 'Patient', 'Admin', 'Receptionist'];
  for (let i = 0; i < roles.length; i += 1) {
    await prisma.role.create({ data: { id: i + 1, roleName: roles[i] } });
  }

  console.log('Seeding specialties and rooms...');
  const specialties = await Promise.all(
    [
      'Cardiology',
      'Dermatology',
      'Pediatrics',
      'Orthopedics',
      'Neurology',
      'Ophthalmology',
      'ENT',
      'Internal Medicine',
    ].map((name) => prisma.specialty.create({ data: { name } }))
  );

  const rooms = await Promise.all(
    ['Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202', 'Room 203'].map(
      (roomName) => prisma.room.create({ data: { roomName } })
    )
  );

  console.log('Seeding admin and receptionist...');
  await createUser({
    email: 'admin@clinic.com',
    password: 'Admin@123',
    fullName: 'Ahmed Hassan',
    phone: '01000000001',
    gender: 'Male',
    roleId: 3,
  });
  await createUser({
    email: 'reception@clinic.com',
    password: 'Reception@123',
    fullName: 'Mona Adel',
    phone: '01000000002',
    gender: 'Female',
    roleId: 4,
  });

  console.log('Seeding doctors...');
  const doctorSeeds = [
    ['doctor@clinic.com', 'Dr. Omar Khaled', 'Male', 0, 350, 250, 'Consultant cardiologist with 12 years of experience in preventive cardiology and echocardiography.'],
    ['sara.derm@clinic.com', 'Dr. Sara Mostafa', 'Female', 1, 300, 200, 'Dermatologist specializing in cosmetic dermatology, acne treatment and laser therapy.'],
    ['youssef.ped@clinic.com', 'Dr. Youssef Adel', 'Male', 2, 250, 180, 'Pediatrician focused on child growth, nutrition and childhood respiratory diseases.'],
    ['nour.ortho@clinic.com', 'Dr. Nour El-Sayed', 'Female', 3, 400, 300, 'Orthopedic surgeon specialized in sports injuries and joint replacement.'],
    ['karim.neuro@clinic.com', 'Dr. Karim Fathy', 'Male', 4, 450, 350, 'Neurologist with a special interest in migraine, epilepsy and movement disorders.'],
    ['hana.eye@clinic.com', 'Dr. Hana Samir', 'Female', 5, 300, 220, 'Ophthalmologist experienced in cataract surgery and pediatric eye care.'],
    ['tarek.ent@clinic.com', 'Dr. Tarek Mahmoud', 'Male', 6, 280, 200, 'ENT specialist treating sinusitis, hearing loss and pediatric ENT conditions.'],
    ['laila.internal@clinic.com', 'Dr. Laila Ibrahim', 'Female', 7, 320, 240, 'Internal medicine consultant focusing on diabetes, hypertension and preventive care.'],
  ];

  const doctors = [];
  for (let i = 0; i < doctorSeeds.length; i += 1) {
    const [email, fullName, gender, specialtyIndex, examFee, consultFee, biography] =
      doctorSeeds[i];
    const user = await createUser({
      email,
      password: 'Doctor@123',
      fullName,
      phone: `0110000000${i + 1}`,
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
  const patientSeeds = [
    ['patient@clinic.com', 'Mariam Ali', 'Female', 1994],
    ['john.smith@example.com', 'John Smith', 'Male', 1987],
    ['fatma.hassan@example.com', 'Fatma Hassan', 'Female', 1979],
    ['mohamed.tarek@example.com', 'Mohamed Tarek', 'Male', 1990],
    ['salma.nabil@example.com', 'Salma Nabil', 'Female', 2001],
    ['ali.mahmoud@example.com', 'Ali Mahmoud', 'Male', 1968],
    ['yasmin.omar@example.com', 'Yasmin Omar', 'Female', 1996],
    ['hassan.adel@example.com', 'Hassan Adel', 'Male', 1983],
    ['dina.fouad@example.com', 'Dina Fouad', 'Female', 1992],
    ['ziad.amr@example.com', 'Ziad Amr', 'Male', 2005],
  ];

  const patients = [];
  for (let i = 0; i < patientSeeds.length; i += 1) {
    const [email, fullName, gender, yearOfBirth] = patientSeeds[i];
    const user = await createUser({
      email,
      password: 'Patient@123',
      fullName,
      phone: `0120000000${i + 1}`,
      gender,
      roleId: 2,
    });
    const patient = await prisma.patient.create({
      data: { userId: user.userId, yearOfBirth },
      include: { person: true },
    });
    patients.push(patient);
  }

  console.log('Seeding schedules...');
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const schedules = [];
  for (let i = 0; i < doctors.length; i += 1) {
    const days = [weekDays[(i * 2) % 7], weekDays[(i * 2 + 2) % 7]];
    for (let j = 0; j < days.length; j += 1) {
      const schedule = await prisma.doctorSchedule.create({
        data: {
          doctorId: doctors[i].id,
          weekDay: days[j],
          roomId: rooms[(i + j) % rooms.length].id,
          startTime: timeOnly(9 + j * 4),
          endTime: timeOnly(12 + j * 4),
          maxCapacity: 8,
        },
      });
      schedules.push(schedule);
    }
  }

  console.log('Seeding appointments and medical records...');
  const diagnoses = [
    ['Seasonal influenza', 'Oseltamivir 75mg twice daily for 5 days', 'Rest and increase fluid intake.'],
    ['Essential hypertension', 'Amlodipine 5mg once daily', 'Reduce salt intake and monitor blood pressure weekly.'],
    ['Iron deficiency anemia', 'Ferrous sulfate 200mg once daily', 'Recheck CBC after 6 weeks.'],
    ['Migraine without aura', 'Sumatriptan 50mg as needed', 'Keep a headache diary and avoid triggers.'],
    ['Acute pharyngitis', 'Amoxicillin 500mg three times daily for 7 days', 'Warm fluids and gargle with salt water.'],
  ];

  let recordIndex = 0;
  for (let i = 0; i < 26; i += 1) {
    const doctor = doctors[i % doctors.length];
    const patient = patients[i % patients.length];
    const doctorSchedules = schedules.filter((s) => s.doctorId === doctor.id);
    const schedule = doctorSchedules[i % doctorSchedules.length];
    const offset = i < 10 ? i - 6 : i - 12;
    let status;
    if (offset < 0) {
      status = i % 5 === 0 ? 'Canceled' : 'Completed';
    } else if (offset === 0) {
      status = i % 2 === 0 ? 'Confirmed' : 'Pending';
    } else {
      status = i % 4 === 0 ? 'Canceled' : i % 2 === 0 ? 'Pending' : 'Confirmed';
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        scheduleId: schedule.id,
        doctorId: doctor.id,
        appointmentType: i % 2 === 0 ? 'Examination' : 'Consultation',
        status,
        appointmentDate: dateOnly(offset),
      },
    });

    if (status === 'Completed') {
      const [diagnosis, prescription, notes] = diagnoses[recordIndex % diagnoses.length];
      await prisma.medicalRecord.create({
        data: {
          appointmentId: appointment.id,
          diagnosis,
          prescription,
          notes,
        },
      });
      recordIndex += 1;
    }
  }

  // Guarantee a rich "today" for the doctor and admin dashboards.
  const todaySchedules = schedules.filter((s) => s.weekDay === weekDays[today.getDay() === 0 ? 6 : today.getDay() - 1]);
  for (let i = 0; i < 6; i += 1) {
    const doctor = doctors[i % doctors.length];
    const doctorToday = todaySchedules.filter((s) => s.doctorId === doctor.id);
    const schedule = doctorToday[0] || schedules.find((s) => s.doctorId === doctor.id);
    await prisma.appointment.create({
      data: {
        patientId: patients[(i + 2) % patients.length].id,
        scheduleId: schedule.id,
        doctorId: doctor.id,
        appointmentType: i % 2 === 0 ? 'Examination' : 'Consultation',
        status: i % 3 === 0 ? 'Confirmed' : 'Pending',
        appointmentDate: dateOnly(0),
      },
    });
  }

  // Guarantee an upcoming appointment for the demo patient account.
  const upcomingSeeds = [
    { doctorIndex: 0, offset: 2, status: 'Confirmed' },
    { doctorIndex: 3, offset: 6, status: 'Pending' },
  ];
  for (const item of upcomingSeeds) {
    const doctor = doctors[item.doctorIndex];
    const schedule = schedules.find((s) => s.doctorId === doctor.id);
    await prisma.appointment.create({
      data: {
        patientId: patients[0].id,
        scheduleId: schedule.id,
        doctorId: doctor.id,
        appointmentType: 'Consultation',
        status: item.status,
        appointmentDate: dateOnly(item.offset),
      },
    });
  }

  const counts = {
    users: await prisma.user.count(),
    doctors: await prisma.doctor.count(),
    patients: await prisma.patient.count(),
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
