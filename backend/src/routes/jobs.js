const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    const APP_ID = process.env.ADZUNA_APP_ID;
    const API_KEY = process.env.ADZUNA_API_KEY;

    // Use default keys if env vars are missing
    const id = APP_ID || "test_id";
    const key = API_KEY || "test_key";

    const queries = [
      "software developer",
      "full stack developer",
      "data analyst",
      "machine learning",
      "cloud engineer",
      "frontend developer",
      "backend developer"
    ];

    let allJobs = [];

    for (let q of queries) {
      try {
        const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${id}&app_key=${key}&results_per_page=10&what=${encodeURIComponent(q)}`;
        const response = await axios.get(url);
        if (response.data && response.data.results) {
          allJobs.push(...response.data.results);
        }
      } catch (innerErr) {
        console.error(`Adzuna fetch failed for query "${q}":`, innerErr.message);
      }
    }

    // Deduplicate jobs by ID
    const uniqueJobs = Array.from(
      new Map(allJobs.map(job => [job.id, job])).values()
    );

    if (uniqueJobs.length === 0) throw new Error("No jobs found from API");

    res.json(uniqueJobs.slice(0, 30));

  } catch (error) {
    console.error("JOB API ERROR:", error.message);

    // Fallback jobs for production stability
    res.json([
      {
        id: "fallback-1",
        company: { display_name: "Google" },
        title: "Software Engineer",
        location: { display_name: "Bangalore" },
        redirect_url: "https://careers.google.com",
        description: "Join Google as a Software Engineer and build products that help millions of users."
      },
      {
        id: "fallback-2",
        company: { display_name: "Amazon" },
        title: "Data Engineer",
        location: { display_name: "Hyderabad" },
        redirect_url: "https://amazon.jobs",
        description: "Amazon is looking for a Data Engineer to join our cloud infrastructure team."
      },
      {
        id: "fallback-3",
        company: { display_name: "Microsoft" },
        title: "Cloud Architect",
        location: { display_name: "Redmond" },
        redirect_url: "https://careers.microsoft.com",
        description: "Shape the future of cloud computing at Microsoft."
      }
    ]);
  }
});

module.exports = router;
