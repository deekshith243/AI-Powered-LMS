const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.adzuna.com/v1/api/jobs/in/search/1",
      {
        params: {
          app_id: process.env.ADZUNA_APP_ID,
          app_key: process.env.ADZUNA_APP_KEY,
          results_per_page: 20,
          what: "developer",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Adzuna error:", error.message);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

module.exports = router;
