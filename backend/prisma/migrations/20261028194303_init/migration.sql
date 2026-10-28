-- CreateEnum
CREATE TYPE "role_enum" AS ENUM ('Admin', 'Doctor', 'Receptionist', 'Patient');

-- CreateEnum
CREATE TYPE "weekday_enum" AS ENUM ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun');

-- CreateEnum
CREATE TYPE "appointment_type_enum" AS ENUM ('Examination', 'Consultation');

-- CreateEnum
CREATE TYPE "appointment_status_enum" AS ENUM ('Pending', 'Confirmed', 'Completed', 'Canceled');

-- CreateEnum
CREATE TYPE "active_enum" AS ENUM ('Yes', 'No');

-- CreateEnum
CREATE TYPE "gender_enum" AS ENUM ('Male', 'Female');

-- CreateTable
CREATE TABLE "specialties" (
    "specialtyid" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("specialtyid")
);

-- CreateTable
CREATE TABLE "rooms" (
    "roomid" SERIAL NOT NULL,
    "roomname" TEXT NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("roomid")
);

-- CreateTable
CREATE TABLE "roles" (
    "roleid" SERIAL NOT NULL,
    "rolename" "role_enum" NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("roleid")
);

-- CreateTable
CREATE TABLE "persons" (
    "userid" SERIAL NOT NULL,
    "fullname" TEXT NOT NULL,
    "phonenumber" TEXT NOT NULL,
    "roleid" INTEGER NOT NULL,
    "gender" "gender_enum" NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("userid")
);

-- CreateTable
CREATE TABLE "users" (
    "userid" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "passwordhash" TEXT NOT NULL,
    "active" "active_enum" NOT NULL DEFAULT 'No',
    "registerdate" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userid")
);

-- CreateTable
CREATE TABLE "otp_verification" (
    "userid" INTEGER NOT NULL,
    "otp_code" TEXT NOT NULL,
    "expirytime" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "otp_verification_pkey" PRIMARY KEY ("userid")
);

-- CreateTable
CREATE TABLE "doctors" (
    "doctorid" SERIAL NOT NULL,
    "userid" INTEGER NOT NULL,
    "specialtyid" INTEGER NOT NULL,
    "examinationfee" DECIMAL(10,2) NOT NULL,
    "consultationfee" DECIMAL(10,2) NOT NULL,
    "biography" TEXT,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("doctorid")
);

-- CreateTable
CREATE TABLE "patients" (
    "patientid" SERIAL NOT NULL,
    "userid" INTEGER NOT NULL,
    "yearofbirth" INTEGER NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("patientid")
);

-- CreateTable
CREATE TABLE "doctorschedules" (
    "scheduleid" SERIAL NOT NULL,
    "doctorid" INTEGER NOT NULL,
    "weekday" "weekday_enum" NOT NULL,
    "roomid" INTEGER NOT NULL,
    "starttime" TIME(6) NOT NULL,
    "endtime" TIME(6) NOT NULL,
    "maxcapacity" INTEGER NOT NULL,

    CONSTRAINT "doctorschedules_pkey" PRIMARY KEY ("scheduleid")
);

-- CreateTable
CREATE TABLE "appointments" (
    "appointmentid" SERIAL NOT NULL,
    "patientid" INTEGER NOT NULL,
    "scheduleid" INTEGER NOT NULL,
    "doctorid" INTEGER NOT NULL,
    "appointmenttype" "appointment_type_enum" NOT NULL,
    "status" "appointment_status_enum" DEFAULT 'Pending',
    "appointmentdate" DATE NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("appointmentid")
);

-- CreateTable
CREATE TABLE "medicalrecords" (
    "recordid" SERIAL NOT NULL,
    "appointmentid" INTEGER NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "prescription" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "medicalrecords_pkey" PRIMARY KEY ("recordid")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_rolename_key" ON "roles"("rolename");

-- CreateIndex
CREATE UNIQUE INDEX "persons_phonenumber_key" ON "persons"("phonenumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_userid_key" ON "users"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_userid_key" ON "doctors"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "patients_userid_key" ON "patients"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "uq_doctor_schedule" ON "doctorschedules"("doctorid", "weekday");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_userid_fkey" FOREIGN KEY ("userid") REFERENCES "persons"("userid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_verification" ADD CONSTRAINT "otp_verification_userid_fkey" FOREIGN KEY ("userid") REFERENCES "persons"("userid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_specialtyid_fkey" FOREIGN KEY ("specialtyid") REFERENCES "specialties"("specialtyid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_userid_fkey" FOREIGN KEY ("userid") REFERENCES "persons"("userid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_userid_fkey" FOREIGN KEY ("userid") REFERENCES "persons"("userid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctorschedules" ADD CONSTRAINT "doctorschedules_doctorid_fkey" FOREIGN KEY ("doctorid") REFERENCES "doctors"("doctorid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctorschedules" ADD CONSTRAINT "doctorschedules_roomid_fkey" FOREIGN KEY ("roomid") REFERENCES "rooms"("roomid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctorid_fkey" FOREIGN KEY ("doctorid") REFERENCES "doctors"("doctorid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientid_fkey" FOREIGN KEY ("patientid") REFERENCES "patients"("patientid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_scheduleid_fkey" FOREIGN KEY ("scheduleid") REFERENCES "doctorschedules"("scheduleid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicalrecords" ADD CONSTRAINT "medicalrecords_appointmentid_fkey" FOREIGN KEY ("appointmentid") REFERENCES "appointments"("appointmentid") ON DELETE CASCADE ON UPDATE CASCADE;
