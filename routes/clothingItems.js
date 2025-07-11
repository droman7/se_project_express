const router = require("express").Router();
const auth = require("../middlewares/auth");
const {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");

const { validateCreateItem, validateId } = require("../middlewares/validation");

router.get("/", getItems);

router.post("/", auth, validateCreateItem, createItem);

router.put("/:itemId/likes", auth, validateId, likeItem);

router.delete("/:itemId/likes", auth, validateId, dislikeItem);

router.delete("/:itemId", auth, validateId, deleteItem);

module.exports = router;
