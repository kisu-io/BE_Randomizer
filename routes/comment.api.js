const express = require("express");
const { createComment } = require("../controllers/comment.controller");

const authenticationMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/:productId"); //all comments of 1 product

router.put("/:commentId"); //update a comment

router.post("/:productId", authenticationMiddleware, createComment); //create comment

router.delete("/:commentId");

module.exports = router;
