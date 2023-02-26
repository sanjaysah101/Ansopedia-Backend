const path = require("path")
const MAXSIZE = 1000000;
const express = require("express");

const checkExtension = (file) => {
    const extension = path.extname(file.name).toLowerCase();
    const mimetype = file.mimetype;
    if (extension === '.png' ||
        extension === '.jpg' ||
        extension === '.jpeg' ||
        mimetype === 'image/png' ||
        mimetype === 'image/jpg' ||
        mimetype === 'image/jpeg'
    ) {
        return true;
    } else {
        return false;
    }
}

class Assets {
    static profileUpload = (req, res, next) => {
        const file = req.files;
        if (file) {
            if (!file.avatar) {
                res.status(400).json([{ "status": "failed", "message": "field name must be avatar" }]);
            } else {
                if (!checkExtension(file.avatar)) {
                    res.status(400).json([{ "status": "failed", "message": "Invalid Extension!!! Only .png, .jpg, .jpeg format is required" }]);
                } else {
                    if (file.avatar.size < MAXSIZE) {
                        let filename = `${req.user.email.split("@")[0]}-${Date.now()}-${file.avatar.name}`;
                        // path.join(__dirname, "..", "logs")
                        const LOC = path.join(__dirname, "..", "assets", "avatar", filename)
                        req.filePath = filename;
                        file.avatar.mv(`${LOC}`, err => {
                            if (err) {
                                res.status(500).json([{ "status": "failed", "message": "Something went wrong" }]);
                            } else {
                                next()
                            }
                        });
                    } else {
                        res.status(400).json([{ "status": "failed", "message": "avatar size is to large", "maxSize": MAXSIZE }]);
                    }
                }
                // console.log(extension)
            }

        } else {
            res.status(404).json([{ "status": "failed", "message": "avatar is missing" }]);
        }

    }
    static getFile = (req, res) => {
        let filename = req.user.avatar;
        if (filename) {
            const LOC = path.join("assets", "avatar", filename)
            res.download(LOC, function (error) {
                if (error)
                    res.status(404).json([{ "status": "failed", "message": "avatar not found" }]);
            })
        } else {
            console.log(filename)
            res.status(404).json([{ "status": "failed", "message": "avatar not found" }]);
        }
    }
}
module.exports = { Assets };