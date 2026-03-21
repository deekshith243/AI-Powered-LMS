const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    const pages = [1, 2, 3, 4]; // 4 pages = ~200 jobs potentially (up to 50 per page)

    const requests = pages.map((page) =>
      axios.get(`https://api.adzuna.com/v1/api/jobs/in/search/${page}`, {
        params: {
          app_id: process.env.ADZUNA_APP_ID,
          app_key: process.env.ADZUNA_APP_KEY,
          results_per_page: 50,
          what: "developer OR engineer OR data OR AI OR ML OR python OR cloud OR devops",
          sort_by: "date",
          where: "india" // Keeping it focused on India as per previous design
        },
      })
    );

    const responses = await Promise.all(requests);
    const allJobs = responses.flatMap((r) => r.data.results);

    res.json({ results: allJobs });
  } catch (error) {
    console.error("Adzuna error:", error.message);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

module.exports = router;
