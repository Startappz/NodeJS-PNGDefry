var https = require('https');
var fs = require('fs');
var os = require('os');
var spawn = require('child_process').spawn;

var wget = require('wget');
var AdmZip = require("adm-zip");

var base_dir = __dirname;
var tmp_dir = base_dir + "/tmp";
var tools_dir = base_dir + "/tools";
var pngdefy_bin_dir = tools_dir + "/bin";

if (!fs.existsSync(tmp_dir)) {
    fs.mkdirSync(tmp_dir, '755');
}
if (!fs.existsSync(tools_dir)) {
    fs.mkdirSync(tmp_dir, '755');
}
if (!fs.existsSync(pngdefy_bin_dir)) {
    fs.mkdirSync(pngdefy_bin_dir, '755');
}

var url = "https://codeload.github.com/jwgcarlson/pngdefry/zip/master";
var tempFile = tmp_dir + "/pngdefry-" + (new Date().getTime()) + ".zip";

function attemptDownload(attemptsLeft) {

    var file = fs.createWriteStream(tempFile);
    var request = https.get(url, function (response) {
        response.pipe(file);
        response.on('error', function (err) {
            if (attemptsLeft === 0) {
                throw err;
            } else {
                attemptDownload(attemptsLeft - 1);
                return;
            }
        });
        response.on('end', function () {
            if (fs.existsSync(tempFile)) {
                try {
                    var zip = new AdmZip(tempFile);
                    zip.extractAllTo(tools_dir, true);
                    fs.unlink(tempFile);


                    var pngdefry_src_path = tools_dir + "/pngdefry-master";
                    if (fs.existsSync(pngdefry_src_path)) {
                        //Everything seems ok.
                        //Rename pngdefry path 

                        //    console.log(fs.existsSync(pngdefry_src_path + "/pngdefry.c"));

                        //Let's configure the tool



                        try {
                            process.chdir(pngdefry_src_path);
                            console.log('New directory: ' + process.cwd());
                        } catch (err) {
                            console.log('chdir: ' + err);
                            process.exit();
                        }
                        var pngdefry_configure_file = "./configure";
                        var params = [pngdefry_configure_file, "--prefix", tools_dir];
                        var pngdefry_config = spawn('sh', params);

                        console.log("trying to configure ");
                        pngdefry_config.on('exit', function (code, signal) {
                            if (code != null) {
                                console.log("pngdefry configured");

                                console.log("Trying to make ");

                                var pngdefry_make = spawn('make');

                                pngdefry_make.on('exit', function (code, signal) {
                                    if (code != null) {
                                        console.log("pngdefry made");

                                        console.log("Trying to make install ");

                                        var pngdefry_make_install = spawn('make', ['install']);


                                        pngdefry_make_install.on('exit', function (code, signal) {
                                            if (code != null) {

                                                console.log("pngdefry made installed");
                                                console.log(fs.existsSync(tools_dir + "/bin/pngdefry"));
                                            } else {
                                                console.log("pngdefry not maded install");
                                            }
                                        });

                                        pngdefry_make_install.on("error", function (err) {
                                            console.log(err);
                                        });


                                    } else {
                                        console.log("pngdefry can not be made made");
                                    }

                                    pngdefry_make.on("error", function (err) {
                                        console.log(err);
                                    });


                                });

                            } else {
                                console.log("pngdefry not configured");
                            }
                        });

                        pngdefry_config.on("error", function (err) {
                            console.log(err);
                        });

                        //   process.exit();

                    } else {
                        if (attemptsLeft === 0) {
                            throw new Error("Can find pngdefry directory");
                            process.exit();
                        } else {
                            attemptDownload(attemptsLeft - 1);
                            return;
                        }
                    }
                } catch (e) {
                    console.log("Trying for " + attemptsLeft);
                    fs.unlink(tempFile);
                    if (attemptsLeft === 0) {
                        throw new Error("Can extract pngdefry package");
                        process.exit();
                    } else {
                        attemptDownload(attemptsLeft - 1);
                        return;
                    }

                }

            } else {

                if (attemptsLeft === 0) {
                    throw new Error("Can not find extracted directory");
                    process.exit();
                } else {
                    attemptDownload(attemptsLeft - 1);
                    return;
                }

            }

        });


    });

}




attemptDownload(4);