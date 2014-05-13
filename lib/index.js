/**
 * This is a wrapper for pngdefry command tool (@link https://github.com/jwgcarlson/pngdefry.git)
 * that reverses the optimzation XCode does on png images included into iPA files to make the images readable by the browser.
 * Requires pngdefry command to be installed on the system
 **/

//Module dependencie

var fs = require("fs");

var path = require("path");

var pngdefry_tool = __dirname + "/../tools/bin/pngdefry";

var PNGDDefry = function () {
    /**
     * @param {string} src_img path for the image to be converted
     * @param {string} destination_dir the path for the output direcotry to save the output image at
     * @param {string} dest_file_suffix by default the outpit image has the same name for the src image
     **/
    this.convert = function (src_img, destination_dir, dest_file_suffix, next) {

        if (!fs.existsSync(pngdefry_tool)) {
            next(new Error("Can not find pngdefry tool , try run npm install inside pngdefry module directory"));
            return;
        }

        var params = ["-l", "-i1024"];

        if (fs.existsSync(src_img)) {
            if (fs.existsSync(destination_dir)) {

                params[params.length] = "-o " + destination_dir;

                if (dest_file_suffix != null && (typeof (dest_file_suffix) == 'string' || typeof (dest_file_suffix) == 'number')) {
                    params[params.length] = "-s" + dest_file_suffix;
                } else {
                    dest_file_suffix = "";
                }

                params[params.length] = src_img;

                var exec = require('child_process').exec;

                var command = pngdefry_tool + " " + params.join(" ");
                exec(command, function (error, stdout, stderr) {
                    if (error) {
                        next(error, null);
                        return;
                    }
                    if (stderr) {
                        next(stderr, null);
                        return;
                    }
                    var img_file = path.basename(src_img, ".png");
                    var dest_img = path.normalize(destination_dir + "/" + img_file + dest_file_suffix + ".png");

                    if (fs.existsSync(dest_img)) {
                        next(null, dest_img);
                    } else {
                        next(new Error("Can not find destination file after conversion is done"),
                            null);
                    }
                });


            } else {
                next(new Error("Destination directory " + destination_dir + " not found."));
            }

        } else {
            next(new Error("Source image " + src_img + " not found."));
        }

    }
}

module.exports = PNGDDefry;