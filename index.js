const fetch = require("node-fetch");
const fs = require("fs/promises");
const xor = require("alegrify-xor");
/**
 * @description An gif that is from red gif
 */
class RedGifGIF {
    constructor(gifName) {
        this.GifName = gifName;

        function getRandInt(max) {
            return Math.floor(Math.random() * Math.floor(max));
        }

        let numb = getRandInt(9);
        do {
            numb = getRandInt(9);
        } while (numb == 0)
        this.HQLink = `https://thcf${numb}.redgifs.com/${this.GifName}.webm`;
        this.LQLink = `https://thcf${numb}.redgifs.com/${this.GifName}-mobile.mp4`;
    }
}

/**
 * 
 * @param {string} url The redgif video you want too download
 * @param {string} file_name The output file name
 * @param {string} output_path The output path
 * @example dl_redgif("https://www.redgifs.com/watch/newdrearyblackwidowspider", "blow job", "./downloads")
 * /.then((path) => console.log(path))
 * /.catch((reason) => console.error(reason));
 * @returns {Promise<string>} An promise of the downloaded file
 */
function dlRedGif(url, file_name, output_path = "", verbose = false) {
    return new Promise((resolve, reject) => {
        if (!xor(url.search("redgif") < 1, url.search("gfycat") < 1))
            reject("Not a redgif URL");
        fetch(url)
            .then(res => res.text())
            .then(res => {
                // find the red gif url
                const regex = /https:\/\/redgifs\.com\/ifr\/(\w+)/;
                if (!regex.test(res))
                    reject("Could not find the redgif gif title");
                let matching;
                do {
                    matching = regex.exec(res);
                } while (matching == null);

                let gif = new RedGifGIF(matching[1]);
                // downloads the videos
                if (verbose)
                    console.log("Fetching the links of the mp4. . .");
                Promise.all([fetch(gif.LQLink), fetch(gif.HQLink)])
                    .then((DownloadedFile) => {
                        if (verbose)
                            console.log("Fetched the downloads link!\nDownloading the video . . .");
                        Promise.all([DownloadedFile[0].buffer(), DownloadedFile[1].buffer()])
                            .then((FileBuffer) => {
                                if (verbose)
                                    console.log("Video downloaed!\nWritting the video to a file");
                                let FileCreationThreads;
                                Promise.all([
                                    fs.writeFile(`${output_path}${file_name}_hq.mp4`, FileBuffer[0], { encoding: "binary" }),
                                    fs.writeFile(`${output_path}${file_name}_lq.mp4`, FileBuffer[1], { encoding: "binary" })
                                ])
                                    .then(() => {
                                        resolve({
                                            HQ: `${output_path}${file_name}_hq.mp4`,
                                            LQ: `${output_path}${file_name}_lq.mp4`
                                        });
                                    })
                                    .catch((reason) => reject(`${reason[0] ?? ""}\n${reason[1] ?? ""}`));
                            })
                            .catch((reason) => {
                                reject(`${reason[0] ?? ""}\n${reason[1] ?? ""}`);
                            });

                    })
                    .catch((reason) => reject(reason));
            })
            .catch(reason => reject(reason));
    });
}
module.exports = dlRedGif;