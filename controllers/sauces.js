const Sauce = require("../models/sauce")
const fs = require("fs")

exports.createSauce = (req, res, next) => {
  const sauce = JSON.parse(req.body.sauce)

  new Sauce({
    ...sauce,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  })
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }))
}

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body }
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Objet modifié !" }))
    .catch((error) => res.status(400).json({ error }))
}

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const [_, filename] = sauce.imageUrl.split("/images/")

      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Objet supprimé !" }))
          .catch((error) => res.status(400).json({ error }))
      })
    })
    .catch((error) => res.status(500).json({ error }))
}

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const userID = req.body.userId;
      const like = req.body.like;

      Sauce.updateOne(
        { _id: req.params.id },
        { $set: (() => {
            if (like === 1) {
              if (sauce.usersLiked.find((_userID) => _userID === userID)) {
                return {}
              }
              return {
                usersLiked: [...sauce.usersLiked, userID],
                likes: sauce.usersLiked.length + 1,
              }
            }

            if (like === -1) {
              if (sauce.usersDisliked.find((_userID) => _userID === userID)) {
                return {}
              }
              return {
                usersDisliked: [...sauce.usersDisliked, userID],
                dislikes: sauce.usersDisliked.length + 1,
              }
            }

            if (like === 0) {
              let set = {}
              if (sauce.usersDisliked.find((_userID) => _userID === userID)) {
                set = {
                  ...set,
                  usersDisliked: sauce.usersDisliked.filter((_userID) => _userID !== userID),
                  dislikes: sauce.usersDisliked.length - 1,
                }
              }
              if (sauce.usersLiked.find((_userID) => _userID === userID)) {
                set = {
                  ...set,
                  usersLiked: sauce.usersLiked.filter((_userID) => _userID !== userID),
                  likes: sauce.usersLiked.length - 1,
                }
              }
              return set
            }

            return {}
          })(),
        }
      )
      .then(() => res.status(200).json({ message: "Actualisation like de la sauce" }))
      .catch((error) => res.status(409).json({ error }))
    })
    .catch((error) => res.status(400).json({ error }))
}

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }))
}

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }))
}