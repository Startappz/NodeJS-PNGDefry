var PNGDDefry = require("../lib");

var png_converter = new PNGDDefry();
png_converter.convert(__dirname + "/AppIcon57x57.png",
    __dirname + "/output",
    null,
    function (err, reesult) {
        console.log(err);
        console.log(reesult);
    });