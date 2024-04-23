const path = require('path');
const MAXSIZE = 1000000;
const express = require('express');
const { AssetsModel } = require('../models/Assets');
const IMAGE_URI = 'https://api.ansopedia.com/images/';
const { unlink, existsSync } = require('fs');
const ApiModel = require('../models/ApiModel');
const Enum = require('./Enum');

const checkExtension = (file) => {
  const extension = path.extname(file.name).toLowerCase();
  const mimetype = file.mimetype;
  if (
    extension === '.png' ||
    extension === '.jpg' ||
    extension === '.jpeg' ||
    extension === '.svg' ||
    mimetype === 'image/png' ||
    mimetype === 'image/jpg' ||
    mimetype === 'image/svg' ||
    mimetype === 'image/jpeg'
  ) {
    return true;
  } else {
    return false;
  }
};

class Assets {
  static profileUpload = (req, res, next) => {
    const file = req.files;
    console.log({ file });
    if (file) {
      if (!file.avatar) {
        res
          .status(400)
          .json(
            ApiModel.getApiModel(
              Enum.status.FAILED,
              'Field name must be avatar'
            )
          );
      } else {
        if (!checkExtension(file.avatar)) {
          res
            .status(400)
            .json(
              ApiModel.getApiModel(
                Enum.status.FAILED,
                'Invalid Extension!!! Only .png, .jpg, .jpeg and .svg format is required'
              )
            );
        } else {
          if (file.avatar.size < MAXSIZE) {
            let filename = `${req.user.email.split('@')[0]}-${Date.now()}-${
              file.avatar.name
            }`;
            // path.join(__dirname, "..", "logs")
            const fileToUpload = path.join(__dirname, '..', 'assets', 'avatar');
            const LOC = path.join(fileToUpload, filename);
            req.filePath = filename;
            if (req.user?.avatar?.picture) {
              console.log(req.user?.avatar?.picture);
              const unlinkFile = path.join(
                fileToUpload,
                req.user?.avatar.picture
              );
              if (existsSync(unlinkFile)) {
                unlink(unlinkFile, (err) => {
                  if (err)
                    res
                      .status(500)
                      .json(
                        ApiModel.getApiModel(
                          Enum.status.FAILED,
                          'Something went wrong'
                        )
                      );
                });
              }
              file.avatar.mv(`${LOC}`, (err) => {
                if (err) {
                  res
                    .status(500)
                    .json(
                      ApiModel.getApiModel(
                        Enum.status.FAILED,
                        'Something went wrong'
                      )
                    );
                } else {
                  next();
                }
              });
            } else {
              // console.log("not")
              // console.log("req.user")
              file.avatar.mv(`${LOC}`, (err) => {
                if (err) {
                  res
                    .status(500)
                    .json(
                      ApiModel.getApiModel(
                        Enum.status.FAILED,
                        'Something went wrong'
                      )
                    );
                } else {
                  next();
                }
              });
            }
            // console.log(unlinkFile)

            // res.end()
          } else {
            res
              .status(400)
              .json(
                ApiModel.getApiModel(
                  Enum.status.FAILED,
                  'Avatar size is too large',
                  { maxSize: MAXSIZE }
                )
              );
          }
        }
        // console.log(extension)
      }
    } else {
      res
        .status(404)
        .json(ApiModel.getApiModel(Enum.status.FAILED, 'Image is missing'));
    }
  };

  static fileUpload = (req, res, next) => {
    const file = req.files;
    // console.log(file)
    if (file) {
      if (!file.image) {
        res
          .status(400)
          .json(
            ApiModel.getApiModel(Enum.status.FAILED, 'Field name must be image')
          );
      } else {
        if (!checkExtension(file.image)) {
          res
            .status(400)
            .json(
              ApiModel.getApiModel(
                Enum.status.FAILED,
                'Invalid Extension!!! Only .png, .jpg, .jpeg format is required'
              )
            );
        } else {
          if (file.image.size < MAXSIZE) {
            // const extension = path.extname(file.image.name).toLowerCase();
            let filename = `${Date.now()}-${file.image.name}`;
            console.log(filename);
            const LOC = path.join(
              __dirname,
              '..',
              'assets',
              'images',
              filename
            );
            file.image.mv(`${LOC}`, async (err) => {
              if (err) {
                res
                  .status(500)
                  .json(
                    ApiModel.getApiModel(
                      Enum.status.FAILED,
                      'Something went wrong'
                    )
                  );
              } else {
                const asset = new AssetsModel({ title: filename });
                asset.save();
                res
                  .status(200)
                  .json(
                    ApiModel.getApiModel(
                      Enum.status.SUCCESS,
                      `${filename} image uploaded successfully`
                    )
                  );
              }
            });
          } else {
            res
              .status(400)
              .json(
                ApiModel.getApiModel(
                  Enum.status.FAILED,
                  'Image size is too large',
                  { maxSize: MAXSIZE }
                )
              );
          }
        }
        // console.log(extension)
      }
    } else {
      res
        .status(404)
        .json(ApiModel.getApiModel(Enum.status.FAILED, 'Image is missing'));
    }
  };

  static getFile = (req, res) => {
    // console.log(req.user.avatar.picture)
    let filename = req.user?.avatar?.picture;
    if (filename) {
      const LOC = path.join('assets', 'avatar', filename);
      res.download(LOC, function (error) {
        if (error)
          res
            .status(404)
            .json(ApiModel.getApiModel(Enum.status.FAILED, 'Image not found'));
      });
    } else {
      console.log({ filename });
      res
        .status(404)
        .json(ApiModel.getApiModel(Enum.status.FAILED, 'Image not found'));
    }
  };
  // static getAvatar = (req, res) => {
  //     const { avatar } = req.params;
  //     console.log(avatar);
  //     // res.send(imageURI)
  //     // let filename = req.user.avatar;
  //     if (avatar) {
  //         const LOC = path.join("assets", "avatar", avatar)
  //         res.download(LOC, function (error) {
  //             if (error)
  //                 res.status(404).json([{ "status": "failed", "message": "avatar not found" }]);
  //         })
  //     } else {
  //         console.log(avatar)
  //         res.status(404).json([{ "status": "failed", "message": "avatar not found" }]);
  //     }
  // }
  static getImage = async (req, res) => {
    const { imageURI } = req.params;
    // console.log(imageURI);
    // res.send(imageURI)
    // let filename = req.user.avatar;
    if (imageURI) {
      const LOC = path.join('assets', 'avatar', imageURI);
      res.download(LOC, (error) => {
        if (error) {
          const NEW_LOC = path.join('assets', 'images', imageURI);
          res.download(NEW_LOC, function (err) {
            if (err) {
              res
                .status(404)
                .json(
                  ApiModel.getApiModel(Enum.status.FAILED, 'Image not found')
                );
            }
          });
        }
      });
    } else {
      const imageList = await AssetsModel.find().select(['-_id', 'title']);
      if (imageList.length > 0) {
        const newImageList = [];
        for (let i of imageList) {
          newImageList.push({ imageUrl: IMAGE_URI + i.title });
          // console.log(i.title)
        }
        res.json(
          ApiModel.getApiModel(Enum.status.SUCCESS, 'Image found', {
            totalImage: imageList.length,
            images: newImageList,
          })
        );
      } else {
        res
          .status(404)
          .json(ApiModel.getApiModel(Enum.status.FAILED, 'Nothing to show'));
      }
    }
  };
}
module.exports = { Assets };
