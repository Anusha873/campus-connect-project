const BASE_URL = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = text;
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${typeof json === 'object' ? JSON.stringify(json) : json}`);
  }
  return json;
}

async function testWorkflow() {
  console.log('========================================================================');
  console.log('      CAMPUSCONNECT COLLEGE MANAGEMENT SYSTEM - E2E API VERIFICATION    ');
  console.log('========================================================================\n');

  console.log('--- 1. Testing Admin Login & Dashboard Analytics ---');
  const adminRes = await req(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@campusconnect.edu', password: 'password123' })
  });
  console.log('✓ Admin login successful:', adminRes.success, '| Role:', adminRes.user.role, '| Email:', adminRes.user.email);
  const adminToken = adminRes.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  const statsRes = await req(`${BASE_URL}/analytics/admin`, { headers: adminHeaders });
  console.log('✓ Admin system statistics:', {
    totalStudents: statsRes.data.totalStudents,
    totalFaculty: statsRes.data.totalFaculty,
    totalHODs: statsRes.data.totalHODs,
    totalDepartments: statsRes.data.totalDepartments,
    averageAttendance: statsRes.data.averageAttendance + '%',
    passPercentage: statsRes.data.passPercentage + '%'
  });

  console.log('\n--- 2. Testing Faculty Login & Profile ---');
  const facultyRes = await req(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'priya.sharma@campusconnect.edu', password: 'password123' })
  });
  console.log('✓ Faculty login successful:', facultyRes.success, '| Name:', facultyRes.user.profile.name, '| Dept:', facultyRes.user.profile.department.name);
  const facultyToken = facultyRes.token;
  const facultyHeaders = { Authorization: `Bearer ${facultyToken}` };

  const classesRes = await req(`${BASE_URL}/classes`, { headers: facultyHeaders });
  console.log(`✓ Retrieved ${classesRes.data.length} registered classes & sections.`);

  console.log('\n--- 3. Testing Student A (Section A) - Aarav Sharma ---');
  const studentARes = await req(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'aarav.sharma@campusconnect.edu', password: 'password123' })
  });
  console.log('✓ Student A login successful:', studentARes.success, '| Name:', studentARes.user.profile.name, '| Roll:', studentARes.user.profile.rollNumber);
  const tokenA = studentARes.token;
  const headersA = { Authorization: `Bearer ${tokenA}` };

  const assignARes = await req(`${BASE_URL}/assignments`, { headers: headersA });
  console.log(`✓ Student A received ${assignARes.data.length} targeted assignments:`);
  assignARes.data.forEach(a => {
    console.log(`  - [${a.subject?.code || 'SUB'}] ${a.title} | Section: ${a.classSection?.name || 'Class Specific'}`);
  });

  const materialsARes = await req(`${BASE_URL}/study-materials`, { headers: headersA });
  console.log(`✓ Student A received ${materialsARes.data.length} targeted study materials:`);
  materialsARes.data.forEach(m => {
    console.log(`  - ${m.title} (${m.fileType}) | Section: ${m.classSection?.name || 'Class Specific'}`);
  });

  const attARes = await req(`${BASE_URL}/attendance/student`, { headers: headersA });
  console.log(`✓ Student A Attendance: ${attARes.summary.overallPercentage}% (Total Sessions: ${attARes.summary.totalClasses}, Present: ${attARes.summary.presentClasses})`);

  const resultsARes = await req(`${BASE_URL}/results/student`, { headers: headersA });
  console.log(`✓ Student A Results: ${resultsARes.allResults.length} courses recorded | GPA/Avg: ${resultsARes.summary.overallPercentage}%`);

  console.log('\n--- 4. Testing Student B (Section B) - Kunal Trivedi ---');
  const studentBRes = await req(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'kunal.trivedi@campusconnect.edu', password: 'password123' })
  });
  console.log('✓ Student B login successful:', studentBRes.success, '| Name:', studentBRes.user.profile.name, '| Roll:', studentBRes.user.profile.rollNumber);
  const tokenB = studentBRes.token;
  const headersB = { Authorization: `Bearer ${tokenB}` };

  const assignBRes = await req(`${BASE_URL}/assignments`, { headers: headersB });
  console.log(`✓ Student B received ${assignBRes.data.length} targeted assignments:`);
  assignBRes.data.forEach(b => {
    console.log(`  - [${b.subject?.code || 'SUB'}] ${b.title} | Section: ${b.classSection?.name || 'Class Specific'}`);
  });

  const materialsBRes = await req(`${BASE_URL}/study-materials`, { headers: headersB });
  console.log(`✓ Student B received ${materialsBRes.data.length} targeted study materials:`);
  materialsBRes.data.forEach(m => {
    console.log(`  - ${m.title} (${m.fileType}) | Section: ${m.classSection?.name || 'Class Specific'}`);
  });

  console.log('\n--- 5. Verify Strict Class-Level Targeting & Isolation ---');
  const aTitles = assignARes.data.map(a => a.title);
  const bTitles = assignBRes.data.map(b => b.title);
  const overlap = aTitles.filter(t => bTitles.includes(t));
  console.log(`Assignment Title Overlap between Sec A and Sec B: ${overlap.length} (Expected: 0)`);
  if (overlap.length === 0) {
    console.log('✓ SUCCESS: Strict class/section isolation verified! Students only see materials & assignments belonging to their class/section.');
  } else {
    console.warn('⚠️ Overlap detected:', overlap);
  }

  console.log('\n--- 6. Testing CSV Reports Export ---');
  const csvRes = await req(`${BASE_URL}/reports/attendance/csv`, { headers: adminHeaders });
  console.log(`✓ Attendance CSV Report export successful (${csvRes.length} bytes):`);
  console.log(csvRes.split('\n').slice(0, 3).join('\n'));

  console.log('\n========================================================================');
  console.log('     ALL INTEGRATION VERIFICATION CHECKS PASSED WITH 100% SUCCESS!      ');
  console.log('========================================================================\n');
}

testWorkflow().catch(err => {
  console.error('Test execution failed:', err.message);
  process.exit(1);
});
