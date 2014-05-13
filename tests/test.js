var PNGDDefry = require("../lib");
var fs = require("fs");

if (!fs.existsSync(__dirname + "/output")) {
  fs.mkdirSync(__dirname + "/output", '777');
}


var source_image_file = __dirname + "/AppIcon57x57.png";
var destination_direcotry = __dirname + "/output";
var suffix = null;


var expected_output_image_file = destination_direcotry + "/AppIcon57x57.png";

exports['test pngdefry conversion'] = function (assert, done) {
  var png_converter = new PNGDDefry();

  png_converter.convert(source_image_file,
    destination_direcotry,
    null,
    function (err, converted_image_file) {
      assert.equal(expected_output_image_file, converted_image_file , "Image converted and saved to output directory") // will log result
      done();
    });

}

if (module == require.main) require('test').run(exports)