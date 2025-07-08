const clothingItem = require("../models/clothingItem");
const { OK, CREATED } = require("../utils/errors");

const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require("../utils/customErrors");

// GET clothing items
const getItems = (req, res, next) => {
  clothingItem
    .find({})
    .then((items) => res.status(OK).send({ data: items }))
    .catch(next);
};

// POST clothing item
const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  clothingItem
    .create({ name, weather, imageUrl, owner })
    .then((item) => res.status(CREATED).send({ data: item }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid item data"));
      }
      next(err);
    });
};

// PUT like item
const likeItem = (req, res, next) => {
  const { itemId } = req.params;

  clothingItem
    .findByIdAndUpdate(
      itemId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    )
    .orFail(() => new NotFoundError("Item not found"))
    .then((item) => res.status(OK).send({ data: item }))
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID"));
      }
      next(err);
    });
};

// PUT dislike item
const dislikeItem = (req, res, next) => {
  const { itemId } = req.params;

  clothingItem
    .findByIdAndUpdate(
      itemId,
      { $pull: { likes: req.user._id } },
      { new: true }
    )
    .orFail(() => new NotFoundError("Item not found"))
    .then((item) => res.status(OK).send({ data: item }))
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID"));
      }
      next(err);
    });
};

// DELETE item
const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  clothingItem
    .findById(itemId)
    .then((item) => {
      if (!item) {
        throw new NotFoundError("Item not found");
      }

      if (item.owner.toString() !== userId.toString()) {
        throw new ForbiddenError("You are not authorized to delete this item");
      }

      return item.deleteOne().then(() => {
        res.status(OK).send({ message: "Item deleted successfully" });
      });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID"));
      }
      next(err);
    });
};

module.exports = {
  getItems,
  createItem,
  likeItem,
  dislikeItem,
  deleteItem,
};
