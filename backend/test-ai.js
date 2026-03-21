const aiController = require('./src/controllers/aiController');

async function test() {
  const res = {
    json: (data) => console.log("SUCCESS:", JSON.stringify(data, null, 2)),
    status: (code) => {
      console.log("STATUS CODE:", code);
      return { json: (data) => console.log("RESPONSE:", JSON.stringify(data, null, 2)) };
    }
  };

  console.log("--- Testing generateResume ---");
  await aiController.generateResume({ body: { role: "React Developer" } }, res);

  console.log("\n--- Testing generateResume (Missing Role) ---");
  await aiController.generateResume({ body: {} }, res);

  console.log("\n--- Testing analyzeATS ---");
  await aiController.analyzeATS({ 
    body: { 
      resumeText: "Experienced React Developer", 
      targetRole: "Senior Engineer" 
    } 
  }, res);

  console.log("\n--- Testing improveResume ---");
  await aiController.improveResume({ 
    body: { 
      resumeText: "React Dev with 5 years exp", 
      targetRole: "Frontend lead" 
    } 
  }, res);
}

test();
