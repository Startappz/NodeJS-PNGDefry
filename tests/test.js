var PNGDDefry = require("../lib");
var fs = require("fs");

if (!fs.existsSync(__dirname + "/output")) {
    fs.mkdirSync(__dirname + "/output", '777');
}


var source_image_file = __dirname + "/AppIcon57x57.png";
var destination_direcotry = __dirname + "/output";
var suffix = null;

var png_converter = new PNGDDefry();

png_converter.convert(source_image_file, destination_direcotry, null, function (err, reesult) {
    console.log(err);
    console.log(reesult);
});