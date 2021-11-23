const puppeteer = require('puppeteer')
const chalk = require('chalk');
const pdf = require('pdfkit');
const fs = require('fs');

let allOptionsArr = process.argv.slice(2);
let link = process.argv[2]; //playlist link
if (link === undefined) {
    console.log(chalk.red("Please🙏 Provide the playlist Link"));
    return;
}
let inputLength = process.argv[3]; //count of video
const { add } = require('cheerio/lib/api/traversing');
let cTab;

async function fn() {
    try {
        const browserOpenInstance = await puppeteer.launch({
            headless: false,
            args: ['--start-maximized'],
            defaultViewport: null
        })
        let allTabs = await browserOpenInstance.pages();
        cTab = allTabs[0];
        await cTab.goto(link)
        await cTab.waitForSelector('h1[id="title"]')
        let name = await cTab.evaluate(function (select) {
            return document.querySelector(select).innerText
        }, 'h1[id="title"]') // pass- function, or argument of function
        let allData = await cTab.evaluate(getData, '#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer')
        console.log(chalk.redBright(name), '->', chalk.greenBright(allData.noOfVideos), chalk.greenBright(allData.noOfViews));

        let totalVideos = allData.noOfVideos.split(" ")[0]
        // console.log(totalVideos)
        //no of videos of current page
        let cVideoslength = await getVideosLength();
        // console.log(cVideoslength);
        while (totalVideos - cVideoslength >= 20) {
            await scrollToBottom()
            cVideoslength = await getVideosLength()
        }
        let finalList = await getStats();
        if (allOptionsArr.includes("print"))
            console.log(finalList.currentList);
        // console.log(finalList.durList)

        if(allOptionsArr.includes("pdf")){
            let pdfDoc = new pdf
            pdfDoc.pipe(fs.createWriteStream('details.pdf'));
            pdfDoc.text(JSON.stringify(finalList.currentList));
            pdfDoc.end();
        }

        let arr = [];
       
        for (let i = 0; i < inputLength; i++) {
            let StrNo = finalList.durList[i];
            // console.log(parseFloat(StrNo));
            arr.push(parseFloat(StrNo));
        }
        // console.log(arr);
        const sum = arr.reduce((partial_sum, a) => partial_sum + a, 0) + inputLength / 2;
        if (inputLength !== undefined) {
            console.log(timeConvert(sum));
        }

        await browserOpenInstance.close();
    } catch (error) {
        console.log(error)
    }
};

if (inputLength === undefined) {
    process.stdout.write('\033c');
    console.log(chalk.greenBright("Provide the count of video next time to find the  total length of videos"));
    setTimeout(() => {
        fn();
    }, 3000);
}else{
    fn();
}

function timeConvert(n) {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return "Total Time is " + chalk.yellowBright(num) + " minutes => " + chalk.blueBright("(") + chalk.blueBright(rhours + " hours and " + rminutes + " minutes)");
}

function getData(selector) {
    let allElems = document.querySelectorAll(selector);
    let noOfVideos = allElems[0].innerText;
    let noOfViews = allElems[1].innerText;
    return {
        noOfVideos,
        noOfViews
    }
}

async function getVideosLength() {
    let length = await cTab.evaluate(getlength, '#contents #thumbnail #img.style-scope.yt-img-shadow')
    return length
}


async function getStats() {
    let list = await cTab.evaluate(getNameAndDuration, '#video-title', "span#text.ytd-thumbnail-overlay-time-status-renderer")
    return list;
}

async function scrollToBottom() {
    await cTab.evaluate(gotoBottom)
    function gotoBottom() {
        window.scrollBy(0, window.innerHeight)
    }
}

function getlength(durationSelect) {
    let durationElem = document.querySelectorAll(durationSelect)
    return durationElem.length;
}

//
function getNameAndDuration(videoSelector, durationSelector) {
    let videoElem = document.querySelectorAll(videoSelector)
    let duratonELem = document.querySelectorAll(durationSelector)

    let currentList = []
    let durList = []
    for (let i = 0; i < duratonELem.length; i++) {
        let videoTitle = videoElem[i].innerText
        let duration = duratonELem[i].innerText
        currentList.push({ videoTitle, duration })
        durList.push(duration);
    }
    return { currentList, durList };//array of objects
}