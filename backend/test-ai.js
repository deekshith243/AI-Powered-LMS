const aiController = require('./src/controllers/aiController');

async function test() {
  const req = {
    body: {
      role: "React Developer",
      name: "Test User",
      skills: "React, Node.js, TypeScript"
    }
  };
  const res = {
    json: (data) => console.log("SUCCESS:", JSON.stringify(data, null, 2)),
    status: (code) => ({ json: (data) => console.log("ERROR", code, data) })
  };

  console.log("Testing generateResume...");
  await aiController.generateResume(req, res);

  console.log("\nTesting analyzeATS...");
  const atsReq = {
    body: {
      resumeText: "Experienced React Developer with 5 years in Node.js",
      targetRole: "Senior Frontend Engineer"
    }
  };
  await aiController.analyzeATS(atsReq, res);
}

test();
