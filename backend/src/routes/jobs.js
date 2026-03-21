const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    const pages = [1, 2, 3, 4]; // 4 pages = ~200 jobs potentially (up to 50 per page)

    const appId = process.env.ADZUNA_APP_ID || "test_id";
    const appKey = process.env.ADZUNA_APP_KEY || "test_key";

    const requests = pages.map((page) =>
      axios.get(`https://api.adzuna.com/v1/api/jobs/in/search/${page}`, {
        params: {
          app_id: appId,
          app_key: appKey,
          results_per_page: 50,
          what: "developer OR engineer OR data OR AI OR ML OR cloud OR devops OR python",
          sort_by: "date"
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
