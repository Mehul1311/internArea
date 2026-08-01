const express = require("express");
const router = express.Router();
const admin = require("./admin");
const intern = require("./internship");
const job = require("./job");

const subscription = require("./subscriptionRoutes");
const language = require("./languageRoutes");
const auth = require("./auth");
const profile = require("./profileRoutes");
const resume = require("./resumeRoutes");
const internships = require("./internshipRoutes");
const applications = require("./applicationRoutes");
const external = require("./external");



router.use("/admin", admin);
router.use("/internship", intern);
router.use("/job", job);

router.use("/subscribe", subscription);
router.use("/language", language);
router.use("/auth", auth);
router.use("/profile", profile);
router.use("/resume", resume);
router.use("/internships", internships);
router.use("/applications", applications);
router.use("/external", external);

module.exports = router;
