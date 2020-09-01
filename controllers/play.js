const Play = require("../models/play");
const User = require("../models/user");

const getAllPlays = async (req, res) => {
  let plays = await Play.find().lean();
  return plays;
};

const postPlay = async (req, res) => {
  const { title, description, imageUrl, isPublic } = req.body;

  if (title.length == 0) return { error: "Title cannot be empty" };
  if (description.length == 0) return { error: "Description cannot be empty" };
  if (imageUrl.length == 0) return { error: "ImageUrl cannot be empty" };

  try {
    const play = new Play({
      title,
      description,
      imageUrl,
      isPublic: isPublic == "on" ? true : false,
      creator: req.id,
      createdAt: Date.now(),
    });

    const playObject = await play.save().catch((err) => {
      return {
        error: "Invalid data",
      };
    });
    return playObject;
  } catch (err) {
    return {
      error: err,
    };
  }
};

const getPlay = async (req, res) => {
  const id = req.params.id;

  const play = await Play.findById(id);
  return play;
};

const deletePlay = async (req, res) => {
  const id = req.params.id;
  const play = await Play.findById(id);

  if (req.id == play.creator) {
    await Play.deleteOne({ _id: id });
  }
};

const editPlay = async (req, res) => {
  const { title, description, imageUrl } = req.body;

  const isPublic = req.body.isPublic == "on" ? true : false;

  try {
    const id = req.params.id;

    if (title) {
      await Play.findByIdAndUpdate(id, { title: title });
    }
    if (description) {
      await Play.findByIdAndUpdate(id, { description: description });
    }
    if (imageUrl) {
      await Play.findByIdAndUpdate(id, { imageUrl: imageUrl });
    }
    if (isPublic) {
      await Play.findByIdAndUpdate(id, { isPublic: isPublic });
    }
    return {};
  } catch (err) {
    return {
      error: err,
    };
  }
};

const likePlay = async (req, res) => {
  const id = req.params.id;

  await Play.findByIdAndUpdate(id, { $addToSet: { usersLiked: req.id } });
  await User.findByIdAndUpdate(req.id, { $addToSet: { likedPlas: id } });
};

module.exports = {
  getAllPlays,
  postPlay,
  getPlay,
  deletePlay,
  editPlay,
  likePlay,
};
