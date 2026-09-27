const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');
const Department = require('../models/Department');
const ClassSection = require('../models/ClassSection');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Timetable = require('../models/Timetable');
const Attendance = require('../models/Attendance');
const InternalMarks = require('../models/InternalMarks');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const StudyMaterial = require('../models/StudyMaterial');
const Announcement = require('../models/Announcement');
const LeaveRequest = require('../models/LeaveRequest');
const ExaminationResult = require('../models/ExaminationResult');
const Notification = require('../models/Notification');

// Sample file generation helper
const createSampleFiles = () => {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const sampleFiles = [
    { name: 'CS501_Module1_DSA_Notes.pdf', content: '%PDF-1.4\n1 0 obj\n<< /Title (CS501 DSA Notes) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF' },
    { name: 'CS502_DBMS_Assignment_1.pdf', content: '%PDF-1.4\n1 0 obj\n<< /Title (DBMS ER Model Assignment) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF' },
    { name: 'CS503_CN_Lab_Manual.pdf', content: '%PDF-1.4\n1 0 obj\n<< /Title (Computer Networks Lab Manual) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF' },
    { name: 'Student_Submission_Aarav.pdf', content: '%PDF-1.4\n1 0 obj\n<< /Title (Aarav Sharma Solution) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF' },
    { name: 'Medical_Certificate_Sample.pdf', content: '%PDF-1.4\n1 0 obj\n<< /Title (Medical Certificate) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF' },
  ];

  sampleFiles.forEach((file) => {
    const fullPath = path.join(uploadDir, file.name);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, file.content, 'utf8');
    }
  });
};

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();
    console.log('Connected. Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      ClassSection.deleteMany({}),
      Subject.deleteMany({}),
      Faculty.deleteMany({}),
      Student.deleteMany({}),
      Timetable.deleteMany({}),
      Attendance.deleteMany({}),
      InternalMarks.deleteMany({}),
      Assignment.deleteMany({}),
      AssignmentSubmission.deleteMany({}),
      StudyMaterial.deleteMany({}),
      Announcement.deleteMany({}),
      LeaveRequest.deleteMany({}),
      ExaminationResult.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    createSampleFiles();
    console.log('Existing data wiped. Creating seed entities...');

    // 1. Create Admin
    const adminUser = await User.create({
      email: 'admin@campusconnect.edu',
      password: 'password123',
      role: 'admin',
    });
    console.log('Admin account created: admin@campusconnect.edu');

    // 2. Create Departments
    const cseDept = await Department.create({
      code: 'CSE',
      name: 'Computer Science and Engineering',
      description: 'Department of Computer Science & Engineering and AI Systems',
    });

    const eceDept = await Department.create({
      code: 'ECE',
      name: 'Electronics and Communication Engineering',
      description: 'Department of Electronics, IoT, and Communication Systems',
    });

    const itDept = await Department.create({
      code: 'IT',
      name: 'Information Technology',
      description: 'Department of Cloud Computing and Information Technology',
    });

    // 3. Create Classes & Sections
    // CSE Year 3, Sem 5, Section A & B
    const classCSE_3_5_A = await ClassSection.create({
      department: cseDept._id,
      year: 3,
      semester: 5,
      section: 'A',
      academicYear: '2025-2026',
    });

    const classCSE_3_5_B = await ClassSection.create({
      department: cseDept._id,
      year: 3,
      semester: 5,
      section: 'B',
      academicYear: '2025-2026',
    });

    // CSE Year 2, Sem 3, Section A
    const classCSE_2_3_A = await ClassSection.create({
      department: cseDept._id,
      year: 2,
      semester: 3,
      section: 'A',
      academicYear: '2025-2026',
    });

    // ECE Year 3, Sem 5, Section A
    const classECE_3_5_A = await ClassSection.create({
      department: eceDept._id,
      year: 3,
      semester: 5,
      section: 'A',
      academicYear: '2025-2026',
    });

    // 4. Create Subjects
    const subDSA = await Subject.create({
      code: 'CS501',
      name: 'Data Structures and Algorithms',
      department: cseDept._id,
      semester: 5,
      credits: 4,
      type: 'theory',
    });

    const subDBMS = await Subject.create({
      code: 'CS502',
      name: 'Database Management Systems',
      department: cseDept._id,
      semester: 5,
      credits: 4,
      type: 'theory',
    });

    const subCN = await Subject.create({
      code: 'CS503',
      name: 'Computer Networks',
      department: cseDept._id,
      semester: 5,
      credits: 3,
      type: 'theory',
    });

    const subOS = await Subject.create({
      code: 'CS504',
      name: 'Operating Systems',
      department: cseDept._id,
      semester: 5,
      credits: 3,
      type: 'theory',
    });

    const subWebTech = await Subject.create({
      code: 'CS505',
      name: 'Full Stack Web Development',
      department: cseDept._id,
      semester: 5,
      credits: 3,
      type: 'practical',
    });

    const subVLSI = await Subject.create({
      code: 'EC501',
      name: 'VLSI Design & Systems',
      department: eceDept._id,
      semester: 5,
      credits: 4,
      type: 'theory',
    });

    // 5. Create 2 HODs
    // HOD 1: CSE
    const hodCseUser = await User.create({
      email: 'hod.cse@campusconnect.edu',
      password: 'password123',
      role: 'hod',
    });

    const hodCseFaculty = await Faculty.create({
      user: hodCseUser._id,
      facultyId: 'HOD-CSE-01',
      name: 'Dr. Ramesh Narayan',
      email: 'hod.cse@campusconnect.edu',
      phone: '+91 9876543210',
      department: cseDept._id,
      designation: 'Head of Department & Professor',
      subjects: [subDSA._id, subOS._id],
      isHOD: true,
      assignedClasses: [
        { department: cseDept._id, year: 3, semester: 5, section: 'A', subject: subDSA._id },
      ],
    });
    cseDept.hod = hodCseFaculty._id;
    await cseDept.save();

    // HOD 2: ECE
    const hodEceUser = await User.create({
      email: 'hod.ece@campusconnect.edu',
      password: 'password123',
      role: 'hod',
    });

    const hodEceFaculty = await Faculty.create({
      user: hodEceUser._id,
      facultyId: 'HOD-ECE-01',
      name: 'Dr. Sunita Varma',
      email: 'hod.ece@campusconnect.edu',
      phone: '+91 9876543211',
      department: eceDept._id,
      designation: 'Head of Department & Professor',
      subjects: [subVLSI._id],
      isHOD: true,
      assignedClasses: [
        { department: eceDept._id, year: 3, semester: 5, section: 'A', subject: subVLSI._id },
      ],
    });
    eceDept.hod = hodEceFaculty._id;
    await eceDept.save();

    // 6. Create 5 Faculty Members
    const facultyData = [
      {
        email: 'priya.sharma@campusconnect.edu',
        name: 'Prof. Priya Sharma',
        facultyId: 'FAC-CSE-02',
        phone: '+91 9876543220',
        department: cseDept._id,
        designation: 'Associate Professor',
        subjects: [subDBMS._id, subWebTech._id],
        assignedClasses: [
          { department: cseDept._id, year: 3, semester: 5, section: 'A', subject: subDBMS._id },
          { department: cseDept._id, year: 3, semester: 5, section: 'A', subject: subWebTech._id },
        ],
      },
      {
        email: 'vikram.singh@campusconnect.edu',
        name: 'Dr. Vikram Singh',
        facultyId: 'FAC-CSE-03',
        phone: '+91 9876543221',
        department: cseDept._id,
        designation: 'Assistant Professor',
        subjects: [subCN._id],
        assignedClasses: [
          { department: cseDept._id, year: 3, semester: 5, section: 'A', subject: subCN._id },
          { department: cseDept._id, year: 3, semester: 5, section: 'B', subject: subCN._id },
        ],
      },
      {
        email: 'ananya.deshmukh@campusconnect.edu',
        name: 'Prof. Ananya Deshmukh',
        facultyId: 'FAC-CSE-04',
        phone: '+91 9876543222',
        department: cseDept._id,
        designation: 'Assistant Professor',
        subjects: [subOS._id],
        assignedClasses: [
          { department: cseDept._id, year: 3, semester: 5, section: 'A', subject: subOS._id },
        ],
      },
      {
        email: 'arjun.mehta@campusconnect.edu',
        name: 'Dr. Arjun Mehta',
        facultyId: 'FAC-CSE-05',
        phone: '+91 9876543223',
        department: cseDept._id,
        designation: 'Assistant Professor',
        subjects: [subDSA._id],
        assignedClasses: [
          { department: cseDept._id, year: 3, semester: 5, section: 'B', subject: subDSA._id },
        ],
      },
      {
        email: 'kavita.reddy@campusconnect.edu',
        name: 'Prof. Kavita Reddy',
        facultyId: 'FAC-ECE-02',
        phone: '+91 9876543224',
        department: eceDept._id,
        designation: 'Associate Professor',
        subjects: [subVLSI._id],
        assignedClasses: [
          { department: eceDept._id, year: 3, semester: 5, section: 'A', subject: subVLSI._id },
        ],
      },
    ];

    const createdFaculty = [];
    for (const f of facultyData) {
      const u = await User.create({
        email: f.email,
        password: 'password123',
        role: 'faculty',
      });
      const fac = await Faculty.create({
        user: u._id,
        facultyId: f.facultyId,
        name: f.name,
        email: f.email,
        phone: f.phone,
        department: f.department,
        designation: f.designation,
        subjects: f.subjects,
        assignedClasses: f.assignedClasses,
      });
      createdFaculty.push(fac);
    }
    console.log('5 Faculty created');

    // Primary faculty for CSE Year 3 Sem 5 Sec A
    const facultyPriya = createdFaculty[0]; // DBMS & WebTech

    // 7. Create 20 Students
    // Group 1: 12 Students in CSE Year 3 Sem 5 Section A
    // Group 2: 4 Students in CSE Year 3 Sem 5 Section B (for section isolation tests)
    // Group 3: 4 Students in ECE Year 3 Sem 5 Section A
    const studentsSeedData = [
      // CSE 3-5-A
      { name: 'Aarav Sharma', email: 'aarav.sharma@campusconnect.edu', roll: '23CSE001', stId: 'ST-CSE-01', gen: 'Male', dob: '2004-03-15', dept: cseDept._id, yr: 3, sem: 5, sec: 'A', parent: 'Rajesh Sharma', pPhone: '+91 9820011001' },
      { name: 'Diya Patel', email: 'diya.patel@campusconnect.edu', roll: '23CSE002', stId: 'ST-CSE-02', gen: 'Female', dob: '2004-06-22', dept: cseDept._id, yr: 3, sem: 5, sec: 'A', parent: 'Kirit Patel', pPhone: '+91 9820011002' },
      { name: 'Rohan Gupta', email: 'rohan.gupta@campusconnect.edu', roll: '23CSE003', stId: 'ST-CSE-03', gen: 'Male', dob: '2004-01-10', dept: cseDept._id, yr: 3, sem: 5, sec: 'A', parent: 'Anil Gupta', pPhone: '+91 9820011003' },
      { name: 'Isha Nair', email: 'isha.nair@campusconnect.edu', roll: '23CSE004', stId: 'ST-CSE-04', gen: 'Female', dob: '2004-09-05', dept: cseDept._id, yr: 3, sem: 5, sec: 'A', parent: 'Suresh Nair', pPhone: '+91 9820011004' },
      { name: 'Aditya Verma', email: 'aditya.verma@campusconnect.edu', roll: '23CSE005', stId: 'ST-CSE-05', gen: 'Male', dob: '2004-04-18', dept: cseDept._id, yr: 3, sem: 5, sec: 'A', parent: 'Manoj Verma', pPhone: '+91 9820011005' },
      { name: 'Ananya Rao', email: 'ananya.rao@campusconnect.edu', roll: '23CSE006', stId: 'ST-CSE-06', gen: 'Female', dob: '2004-11-30', dept: cseDept._id, yr: 3, sem: 5, sec: 'A', parent: 'Venkat Rao', pPhone: '+91 9820011006' },
      { name: 'Kabir Kapoor', email: 'kabir.kapoor@campusconnect.edu', roll: '23CSE007', stId: 'ST-CSE-07', gen: 'Male', dob: '2004-07-14', dept: cseDept._id, yr: 3, sem: 5, sec: 'A', parent: 'Sameer Kapoor', pPhone: '+91 9820011007' },
      { name: 'Pooja Joshi', email: 'pooja.joshi@campusconnect.edu', roll: '23CSE008', stId: 'ST-CSE-08', gen: 'Female', dob: '2004-02-25', dept: cseDept._id, yr: 3, sem: 5, sec: 'A', parent: 'Dinesh Joshi', pPhone: '+91 9820011008' },
      { name: 'Siddharth Roy', email: 'siddharth.roy@campusconnect.edu', roll: '23CSE009', stId: 'ST-CSE-09', gen: 'Male', dob: '2004-10-12', dept: cseDept._id, yr: 3, sem: 5, sec: 'A', parent: 'Subhash Roy', pPhone: '+91 9820011009' },
      { name: 'Meera Iyer', email: 'meera.iyer@campusconnect.edu', roll: '23CSE010', stId: 'ST-CSE-10', gen: 'Female', dob: '2004-05-08', dept: cseDept._id, yr: 3, sem: 5, sec: 'A', parent: 'Sundaram Iyer', pPhone: '+91 9820011010' },
      { name: 'Varun Bhatia', email: 'varun.bhatia@campusconnect.edu', roll: '23CSE011', stId: 'ST-CSE-11', gen: 'Male', dob: '2004-12-04', dept: cseDept._id, yr: 3, sem: 5, sec: 'A', parent: 'Harish Bhatia', pPhone: '+91 9820011011' },
      { name: 'Tanvi Saxena', email: 'tanvi.saxena@campusconnect.edu', roll: '23CSE012', stId: 'ST-CSE-12', gen: 'Female', dob: '2004-08-19', dept: cseDept._id, yr: 3, sem: 5, sec: 'A', parent: 'Pradeep Saxena', pPhone: '+91 9820011012' },

      // CSE 3-5-B
      { name: 'Kunal Trivedi', email: 'kunal.trivedi@campusconnect.edu', roll: '23CSE051', stId: 'ST-CSE-51', gen: 'Male', dob: '2004-03-21', dept: cseDept._id, yr: 3, sem: 5, sec: 'B', parent: 'Ashok Trivedi', pPhone: '+91 9820011051' },
      { name: 'Riya Sen', email: 'riya.sen@campusconnect.edu', roll: '23CSE052', stId: 'ST-CSE-52', gen: 'Female', dob: '2004-09-17', dept: cseDept._id, yr: 3, sem: 5, sec: 'B', parent: 'Debashis Sen', pPhone: '+91 9820011052' },
      { name: 'Nikhil Agarwal', email: 'nikhil.agarwal@campusconnect.edu', roll: '23CSE053', stId: 'ST-CSE-53', gen: 'Male', dob: '2004-05-30', dept: cseDept._id, yr: 3, sem: 5, sec: 'B', parent: 'Sanjay Agarwal', pPhone: '+91 9820011053' },
      { name: 'Sneha Kulkarni', email: 'sneha.kulkarni@campusconnect.edu', roll: '23CSE054', stId: 'ST-CSE-54', gen: 'Female', dob: '2004-11-11', dept: cseDept._id, yr: 3, sem: 5, sec: 'B', parent: 'Anant Kulkarni', pPhone: '+91 9820011054' },

      // ECE 3-5-A
      { name: 'Akash Mukherjee', email: 'akash.mukherjee@campusconnect.edu', roll: '23ECE001', stId: 'ST-ECE-01', gen: 'Male', dob: '2004-01-29', dept: eceDept._id, yr: 3, sem: 5, sec: 'A', parent: 'Partha Mukherjee', pPhone: '+91 9820011081' },
      { name: 'Shreya Menon', email: 'shreya.menon@campusconnect.edu', roll: '23ECE002', stId: 'ST-ECE-02', gen: 'Female', dob: '2004-06-14', dept: eceDept._id, yr: 3, sem: 5, sec: 'A', parent: 'Gopal Menon', pPhone: '+91 9820011082' },
      { name: 'Vivek Chawla', email: 'vivek.chawla@campusconnect.edu', roll: '23ECE003', stId: 'ST-ECE-03', gen: 'Male', dob: '2004-08-03', dept: eceDept._id, yr: 3, sem: 5, sec: 'A', parent: 'Rakesh Chawla', pPhone: '+91 9820011083' },
      { name: 'Kriti Pandey', email: 'kriti.pandey@campusconnect.edu', roll: '23ECE004', stId: 'ST-ECE-04', gen: 'Female', dob: '2004-12-28', dept: eceDept._id, yr: 3, sem: 5, sec: 'A', parent: 'Alok Pandey', pPhone: '+91 9820011084' },
    ];

    const createdStudents = [];
    for (const s of studentsSeedData) {
      const u = await User.create({
        email: s.email,
        password: 'password123',
        role: 'student',
      });

      const st = await Student.create({
        user: u._id,
        studentId: s.stId,
        rollNumber: s.roll,
        name: s.name,
        email: s.email,
        phone: '+91 9876540000',
        gender: s.gen,
        dateOfBirth: new Date(s.dob),
        department: s.dept,
        course: 'B.Tech',
        year: s.yr,
        semester: s.sem,
        section: s.sec,
        admissionYear: 2023,
        address: 'Campus Hostel Block B, Room 204',
        parentName: s.parent,
        parentPhone: s.pPhone,
      });
      createdStudents.push(st);
    }
    console.log('20 Students created');

    const primaryStudent = createdStudents[0]; // Aarav Sharma (CSE Year 3 Sem 5 Sec A)

    // 8. Create Timetable for CSE Year 3 Sem 5 Sec A
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [
      { period: 1, start: '09:00', end: '10:00', sub: subDSA._id, fac: hodCseFaculty._id, room: 'Lecture Hall 101' },
      { period: 2, start: '10:00', end: '11:00', sub: subDBMS._id, fac: facultyPriya._id, room: 'Lecture Hall 101' },
      { period: 3, start: '11:15', end: '12:15', sub: subCN._id, fac: createdFaculty[1]._id, room: 'Lecture Hall 101' },
      { period: 4, start: '13:00', end: '14:00', sub: subOS._id, fac: createdFaculty[2]._id, room: 'Lab 203' },
      { period: 5, start: '14:00', end: '15:00', sub: subWebTech._id, fac: facultyPriya._id, room: 'Software Lab 1' },
    ];

    for (const day of days) {
      for (const p of periods) {
        await Timetable.create({
          department: cseDept._id,
          year: 3,
          semester: 5,
          section: 'A',
          day,
          period: p.period,
          startTime: p.start,
          endTime: p.end,
          subject: p.sub,
          faculty: p.fac,
          roomNumber: p.room,
        });
      }
    }
    console.log('Weekly Timetable created');

    // 9. Create Attendance Records for CSE 3-5-A
    const cseStudentsGroupA = createdStudents.filter((s) => s.section === 'A' && s.department.toString() === cseDept._id.toString());
    const pastDates = [];
    for (let i = 15; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        d.setHours(0, 0, 0, 0);
        pastDates.push(d);
      }
    }

    for (const dt of pastDates) {
      for (const student of cseStudentsGroupA) {
        // Randomly 90% present, 10% absent (except Aarav who has 93% present)
        const isPresent = student._id.toString() === primaryStudent._id.toString() ? (dt.getDate() % 10 !== 0) : (Math.random() > 0.12);
        await Attendance.create({
          student: student._id,
          faculty: facultyPriya._id,
          subject: subDBMS._id,
          department: cseDept._id,
          year: 3,
          semester: 5,
          section: 'A',
          date: dt,
          status: isPresent ? 'Present' : 'Absent',
        });
      }
    }
    console.log('Attendance records populated');

    // 10. Create Assignments (Strictly targeted to CSE Year 3 Sem 5 Sec A)
    const assignment1 = await Assignment.create({
      title: 'Database Normalization and BCNF Design Case Study',
      description: 'Analyze the given University Examination schema and decompose up to Boyce-Codd Normal Form (BCNF). Submit complete dependency diagram and SQL schema script.',
      subject: subDBMS._id,
      department: cseDept._id,
      year: 3,
      semester: 5,
      section: 'A',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // in 7 days
      maxMarks: 50,
      attachment: '/uploads/CS502_DBMS_Assignment_1.pdf',
      attachmentName: 'CS502_DBMS_Assignment_1.pdf',
      faculty: facultyPriya._id,
    });

    const assignment2 = await Assignment.create({
      title: 'B+ Tree Implementation and Indexing Analysis',
      description: 'Implement a working B+ Tree in C++ or Java with order 4. Measure insertion and search benchmarks against standard Hash Maps.',
      subject: subDSA._id,
      department: cseDept._id,
      year: 3,
      semester: 5,
      section: 'A',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // in 14 days
      maxMarks: 100,
      attachment: '/uploads/CS501_Module1_DSA_Notes.pdf',
      attachmentName: 'CS501_Module1_DSA_Notes.pdf',
      faculty: hodCseFaculty._id,
    });

    // Create an assignment targeted to Section B only (to verify section-filtering works)
    const assignmentSecB = await Assignment.create({
      title: 'Section B Special Networking Assignment: Socket Programming',
      description: 'Build a multi-client chat server using TCP Sockets in Python.',
      subject: subCN._id,
      department: cseDept._id,
      year: 3,
      semester: 5,
      section: 'B',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      maxMarks: 50,
      faculty: createdFaculty[1]._id,
    });

    // Create a sample submission for primaryStudent on assignment 1
    await AssignmentSubmission.create({
      assignment: assignment1._id,
      student: primaryStudent._id,
      submissionDate: new Date(),
      status: 'Evaluated',
      attachment: '/uploads/Student_Submission_Aarav.pdf',
      attachmentName: 'Student_Submission_Aarav.pdf',
      submissionNotes: 'All normalization steps from 1NF to BCNF documented with candidate key proofs.',
      obtainedMarks: 47,
      feedback: 'Excellent decomposition and clear explanation of multi-valued dependencies.',
      evaluatedBy: facultyPriya._id,
      evaluatedAt: new Date(),
    });
    console.log('Assignments and submissions created');

    // 11. Create Study Materials (Strictly targeted to CSE Year 3 Sem 5 Sec A)
    await StudyMaterial.create({
      title: 'DBMS Unit 3: Transaction Processing & ACID Properties',
      description: 'Comprehensive lecture slides covering 2PL concurrency control and serializability protocols.',
      subject: subDBMS._id,
      department: cseDept._id,
      year: 3,
      semester: 5,
      section: 'A',
      fileUrl: '/uploads/CS502_DBMS_Assignment_1.pdf',
      fileName: 'DBMS_Unit3_Transactions.pdf',
      fileType: 'PDF',
      fileSize: 2450000,
      uploadedBy: facultyPriya._id,
    });

    await StudyMaterial.create({
      title: 'Computer Networks: OSI vs TCP/IP Architecture & IP Addressing',
      description: 'Complete reference notes for subnetting, CIDR, and routing table algorithms.',
      subject: subCN._id,
      department: cseDept._id,
      year: 3,
      semester: 5,
      section: 'A',
      fileUrl: '/uploads/CS503_CN_Lab_Manual.pdf',
      fileName: 'CN_Module2_Subnetting_Guide.pdf',
      fileType: 'PDF',
      fileSize: 3120000,
      uploadedBy: createdFaculty[1]._id,
    });

    // Material targeted to Sec B only
    await StudyMaterial.create({
      title: 'Section B Exclusive: Distributed Systems Notes',
      description: 'Distributed commit and Paxos consensus algorithm reference.',
      subject: subDSA._id,
      department: cseDept._id,
      year: 3,
      semester: 5,
      section: 'B',
      fileUrl: '/uploads/CS501_Module1_DSA_Notes.pdf',
      fileName: 'SecB_Distributed_Systems.pdf',
      fileType: 'PDF',
      fileSize: 1890000,
      uploadedBy: createdFaculty[3]._id,
    });
    console.log('Study Materials created');

    // 12. Create Announcements
    await Announcement.create({
      title: 'Annual Tech Symposium: HackConnect 2026',
      message: 'Registrations are now open for the 48-hour inter-college national Hackathon. Cash prizes up to ₹3,00,000. All departments are encouraged to form multi-disciplinary teams.',
      createdBy: adminUser._id,
      creatorName: 'College Administration',
      role: 'admin',
      type: 'college',
      priority: 'high',
    });

    await Announcement.create({
      title: 'CSE Department: Guest Lecture on Generative AI & LLMs in Production',
      message: 'The Department of Computer Science is hosting a distinguished keynote speaker from Google Cloud on modern transformer architectures this Friday at 2:00 PM in the Auditorium.',
      createdBy: hodCseUser._id,
      creatorName: 'Dr. Ramesh Narayan (HOD CSE)',
      role: 'hod',
      type: 'department',
      department: cseDept._id,
      priority: 'normal',
    });

    await Announcement.create({
      title: 'Class Announcement: DBMS Quiz 2 Scheduled',
      message: 'Attention CSE Year 3 Section A students: Quiz 2 covering Relational Algebra and SQL Joins will take place during period 2 this Thursday.',
      createdBy: facultyPriya.user,
      creatorName: 'Prof. Priya Sharma',
      role: 'faculty',
      type: 'class',
      department: cseDept._id,
      targetYear: 3,
      targetSemester: 5,
      targetSection: 'A',
      priority: 'high',
    });
    console.log('Announcements created');

    // 13. Create Leave Requests
    await LeaveRequest.create({
      student: primaryStudent._id,
      department: cseDept._id,
      reason: 'Attending IEEE Student Chapter National Conference at Bangalore as paper presenter.',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      numberOfDays: 3,
      supportingDocument: '/uploads/Medical_Certificate_Sample.pdf',
      documentName: 'Conference_Invitation_Letter.pdf',
      status: 'Approved',
      reviewedBy: hodCseUser._id,
      reviewerName: 'Dr. Ramesh Narayan',
      reviewComment: 'Approved. Best wishes for the paper presentation.',
      reviewedAt: new Date(),
    });

    await LeaveRequest.create({
      student: createdStudents[1]._id, // Diya Patel
      department: cseDept._id,
      reason: 'Severe viral fever and medical recuperation.',
      startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      numberOfDays: 3,
      supportingDocument: '/uploads/Medical_Certificate_Sample.pdf',
      documentName: 'Medical_Certificate_Sample.pdf',
      status: 'Pending',
    });
    console.log('Leave requests created');

    // 14. Create Internal Marks
    const subjectsList = [subDSA, subDBMS, subCN, subOS, subWebTech];
    for (const student of cseStudentsGroupA) {
      for (const sub of subjectsList) {
        // Internal Assessment 1
        const maxMarks = 50;
        const obtained = Math.floor(Math.random() * 15) + 35; // 35 to 49
        await InternalMarks.create({
          student: student._id,
          subject: sub._id,
          faculty: facultyPriya._id,
          examType: 'Internal Assessment 1',
          maxMarks,
          obtainedMarks: obtained,
          semester: 5,
          academicYear: '2025-2026',
        });

        // Mid Term Exam
        const midMax = 50;
        const midObtained = Math.floor(Math.random() * 14) + 36;
        await InternalMarks.create({
          student: student._id,
          subject: sub._id,
          faculty: facultyPriya._id,
          examType: 'Mid Term Exam',
          maxMarks: midMax,
          obtainedMarks: midObtained,
          semester: 5,
          academicYear: '2025-2026',
        });
      }
    }
    console.log('Internal Marks created');

    // 15. Create Examination Results (Semester 4 historical results for CSE students)
    const examSubjects = [subDSA, subDBMS, subCN, subOS, subWebTech];

    for (const student of cseStudentsGroupA) {
      const grades = [
        { subject: examSubjects[0]._id, name: 'Data Structures & Algorithms', max: 100, obt: 88, grade: 'A+', gp: 9 },
        { subject: examSubjects[1]._id, name: 'Database Management Systems', max: 100, obt: 92, grade: 'O', gp: 10 },
        { subject: examSubjects[2]._id, name: 'Computer Networks', max: 100, obt: 85, grade: 'A+', gp: 9 },
        { subject: examSubjects[3]._id, name: 'Operating Systems', max: 100, obt: 79, grade: 'A', gp: 8 },
        { subject: examSubjects[4]._id, name: 'Full Stack Web Development', max: 100, obt: 94, grade: 'O', gp: 10 },
      ];

      for (const g of grades) {
        await ExaminationResult.create({
          student: student._id,
          subject: g.subject,
          examName: 'Semester 4 University End Examinations May 2025',
          maxMarks: g.max,
          obtainedMarks: student._id.toString() === primaryStudent._id.toString() ? g.obt : Math.max(40, g.obt - Math.floor(Math.random() * 12)),
          grade: g.grade,
          gradePoint: g.gp,
          status: 'Pass',
          semester: 4,
          academicYear: '2024-2025',
        });
      }
    }
    console.log('Examination results created');

    // 16. Create Notifications for primary student
    await Notification.create({
      user: primaryStudent.user,
      title: 'Assignment Evaluated: Database Normalization',
      message: 'Prof. Priya Sharma has evaluated your submission. Score: 47/50.',
      type: 'assignment',
      link: '/student/assignments',
      isRead: false,
    });

    await Notification.create({
      user: primaryStudent.user,
      title: 'Leave Request Approved',
      message: 'Your leave application for IEEE Conference has been approved by HOD Dr. Ramesh Narayan.',
      type: 'leave',
      link: '/student/leave',
      isRead: false,
    });

    await Notification.create({
      user: primaryStudent.user,
      title: 'Class Announcement: DBMS Quiz 2',
      message: 'Quiz 2 covering Relational Algebra scheduled for this Thursday.',
      type: 'announcement',
      link: '/announcements',
      isRead: true,
    });

    console.log('\n============================================================');
    console.log(' CAMPUSCONNECT TEST DATA SEEDED SUCCESSFULLY!');
    console.log('============================================================');
    console.log('\nDEFAULT TEST CREDENTIALS (All passwords: password123):');
    console.log('------------------------------------------------------------');
    console.log('ADMIN:');
    console.log('  Email: admin@campusconnect.edu | Password: password123');
    console.log('\nHODs:');
    console.log('  CSE HOD: hod.cse@campusconnect.edu | Password: password123');
    console.log('  ECE HOD: hod.ece@campusconnect.edu | Password: password123');
    console.log('\nFACULTY:');
    console.log('  CSE Faculty: priya.sharma@campusconnect.edu | Password: password123');
    console.log('  CSE Faculty: vikram.singh@campusconnect.edu | Password: password123');
    console.log('  CSE Faculty: ananya.deshmukh@campusconnect.edu | Password: password123');
    console.log('\nSTUDENTS:');
    console.log('  Primary Student (CSE Y3 S5 Sec A): aarav.sharma@campusconnect.edu | Password: password123');
    console.log('  Student 2 (CSE Y3 S5 Sec A):       diya.patel@campusconnect.edu   | Password: password123');
    console.log('  Student 3 (CSE Y3 S5 Sec B):       kunal.trivedi@campusconnect.edu| Password: password123');
    console.log('  Student 4 (ECE Y3 S5 Sec A):       akash.mukherjee@campusconnect.edu | Password: password123');
    console.log('============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
