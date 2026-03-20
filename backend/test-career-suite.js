const API_URL = 'http://localhost:5000/api';
let token = '';

async function login() {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@lms.com', password: '123456' })
    });
    const data = await res.json();
    token = data.accessToken;
    if (token) console.log('✅ Logged in successfully');
    else console.log('❌ Login failed: No token received');
  } catch (err) {
    console.error('❌ Login failed:', err.message);
  }
}

async function testResumeGen() {
  try {
    console.log('\n--- Testing Resume Generation ---');
    const res = await fetch(`${API_URL}/ai/resume`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        role: 'Node.js Developer',
        name: 'Test User',
        skills: 'JavaScript, Express, MySQL'
      })
    });
    const data = await res.json();
    console.log('✅ Resume Generated:', data.resume?.substring(0, 100) + '...');
  } catch (err) {
    console.error('❌ Resume Gen failed:', err.message);
  }
}

async function testATS() {
  try {
    console.log('\n--- Testing ATS Analysis ---');
    const res = await fetch(`${API_URL}/ai/ats`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        resumeText: 'Experience in Node.js and Express. Looking for backend roles.',
        targetRole: 'Backend Engineer'
      })
    });
    const data = await res.json();
    console.log('✅ ATS Score:', data.score);
    console.log('✅ Suggestions:', data.suggestions?.slice(0, 2));
  } catch (err) {
    console.error('❌ ATS Analysis failed:', err.message);
  }
}

async function testInterview() {
  try {
    console.log('\n--- Testing Mock Interview ---');
    const startRes = await fetch(`${API_URL}/ai/interview/start`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role: 'React Developer' })
    });
    const startData = await startRes.json();
    console.log('✅ Questions Generated:', startData.questions?.length);

    const evalRes = await fetch(`${API_URL}/ai/interview/evaluate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        role: 'React Developer',
        questions: startData.questions,
        userAnswers: ['I use hooks for state.', 'Component based architecture.', 'Virtual DOM is fast.', 'Prop drilling is avoided.', 'I like React.']
      })
    });
    const evalData = await evalRes.json();
    console.log('✅ Evaluation Score:', evalData.score);
  } catch (err) {
    console.error('❌ Interview tests failed:', err.message);
  }
}

async function runTests() {
  await login();
  if (token) {
    await testResumeGen();
    await testATS();
    await testInterview();
  }
}

runTests();
