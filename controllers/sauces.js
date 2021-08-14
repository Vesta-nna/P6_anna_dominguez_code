const Sauce = require("../models/sauce")
const fs = require("fs")

exports.createThing = (req, res, next) => {
  const sauce = JSON.parse(req.body.sauce)

  new Sauce({
    ...sauce,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  })
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }))
}

exports.modifyThing = (req, res, next) => {
  const thingObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body }
  Sauce.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Objet modifié !" }))
    .catch((error) => res.status(400).json({ error }))
}

exports.deleteThing = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((thing) => {
      const [_, filename] = thing.imageUrl.split("/images/")

      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Objet supprimé !" }))
          .catch((error) => res.status(400).json({ error }))
      })
    })
    .catch((error) => res.status(500).json({ error }))
}

exports.likeThing = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauceUnique) => {
      const userID = req.body.userId;
      const like = req.body.like;

      Sauce.updateOne(
        { _id: req.params.id },
        {
          $set: (() => {
            if (like === 1) {
              if (sauceUnique.usersLiked.find((_userID) => _userID === userID)) {
                return {}
              }

              return {
                usersLiked: [...sauceUnique.usersLiked, userID],
                likes: sauceUnique.usersLiked.length + 1,
              }
            }

            if (like === -1) {
              if (sauceUnique.usersDisliked.find((_userID) => _userID === userID)) {
                return {}
              }

              return {
                usersDisliked: [...sauceUnique.usersDisliked, userID],
                dislikes: sauceUnique.usersDisliked.length + 1,
              }
            }

            if (like === 0) {
              let set = {}

              if (sauceUnique.usersDisliked.find((_userID) => _userID === userID)) {
                set = {
                  ...set,
                  usersDisliked: sauceUnique.usersDisliked.filter((_userID) => _userID !== userID),
                  dislikes: sauceUnique.usersDisliked.length - 1,
                }
              }

              if (sauceUnique.usersLiked.find((_userID) => _userID === userID)) {
                set = {
                  ...set,
                  usersLiked: sauceUnique.usersLiked.filter((_userID) => _userID !== userID),
                  likes: sauceUnique.usersLiked.length - 1,
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

exports.getOneThing = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((things) => res.status(200).json(things))
    .catch((error) => res.status(404).json({ error }))
}

exports.getAllThing = (req, res, next) => {
  Sauce.find()
    .then((things) => res.status(200).json(things))
    .catch((error) => res.status(400).json({ error }))
}