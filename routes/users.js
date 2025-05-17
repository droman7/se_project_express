const router = require("express").Router();
const auth = require("../middlewares/auth");
const { getCurrentUser, updateCurrentUser } = require("../controllers/users");

router.use(auth);
router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, updateCurrentUser);

module.exports = router;
