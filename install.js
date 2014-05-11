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
    fs.mkdirSync(tools_dir, '755');
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
                    zip.extractAllTo(tmp_dir, true);
                    fs.unlink(tempFile);
                    var pngdefry_src_path = tmp_dir + "/pngdefry-master";
                    if (fs.existsSync(pngdefry_src_path)) {
                        //Everything seems ok.
                        //Rename pngdefry path 
                        //Let's configure the tool
                        try {
                            process.chdir(pngdefry_src_path);
                        } catch (err) {
                            deleteFolderRecursive(tmp_dir);
                            process.exit();
                        }
                        var pngdefry_configure_file = "./configure";
                        var params = [pngdefry_configure_file, "--prefix", tools_dir];
                        var pngdefry_config = spawn('sh', params);

                        pngdefry_config.on('exit', function (code, signal) {
                            if (code != null) {

                                var pngdefry_make = spawn('make');

                                pngdefry_make.on('exit', function (code, signal) {
                                    if (code != null) {
                                        var pngdefry_make_install = spawn('make', ['install']);
                                        pngdefry_make_install.on('exit', function (code, signal) {
                                            if (code != null) {
                                               // PNGdefy installed successfully
                                                deleteFolderRecursive(tmp_dir);
                                            } else {
                                                attemptDownload(attemptsLeft - 1);
                                            }
                                        });

                                        pngdefry_make_install.on("error", function (err) {
                                            attemptDownload(attemptsLeft - 1);
                                        });


                                    }
                                    pngdefry_make.on("error", function (err) {
                                        attemptDownload(attemptsLeft - 1);
                                    });


                                });

                            } else {
                                attemptDownload(attemptsLeft - 1);
                                return;
                            }
                        });

                        pngdefry_config.on("error", function (err) {
                            console.log(err);
                        });

                        //   process.exit();

                    } else {
                        if (attemptsLeft === 0) {
                            throw new Error("Can find pngdefry directory");

                            deleteFolderRecursive(tmp_dir);
                            process.exit();
                        } else {
                            attemptDownload(attemptsLeft - 1);
                            return;
                        }
                    }
                } catch (e) {
                    fs.unlink(tempFile);
                    if (attemptsLeft === 0) {
                        throw new Error("Can extract pngdefry package");
                        deleteFolderRecursive(tmp_dir);
                        process.exit();
                    } else {
                        attemptDownload(attemptsLeft - 1);
                        return;
                    }

                }

            } else {
                if (attemptsLeft === 0) {
                    throw new Error("Can not find extracted directory");
                    deleteFolderRecursive(tmp_dir);
                    process.exit();
                } else {
                    attemptDownload(attemptsLeft - 1);
                    return;
                }

            }

        });


    });

}

var deleteFolderRecursive = function (path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};


attemptDownload(4);