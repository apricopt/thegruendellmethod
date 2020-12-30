const puppeteer = require('puppeteer');
const express = require('express');

const router = express.Router();



router.get("/pupeteeer" , (req, res)=> {
    try {
        (async () => {
            /** by default puppeteer launch method have headless option true*/
            const browser = await puppeteer.launch({
                headless: true
            });
            const page = await browser.newPage();
            // page.on('request', (request) => {
            //     if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
            //         request.abort();
            //     } else {
            //         request.continue();
            //     }
            // });
            await page.goto('https://www.instagram.com/thegruendellmethod/');
           
            await page.setRequestInterception(true);

            /** waitfor while loding the page, otherwise evaulate method will get failed. */
            await page.waitFor(500);
            const list = await page.evaluate(() => {
                let data = []            /** this can be changed for other website.*/
                const list = document.querySelectorAll('.v1Nh3');
                for (const a of list) {
                    data.push({
                        'link': a.querySelector('a').href
                    })
                }
                return data;
            })
            console.log(list);
            await browser.close();
            res.render("connect", {
                link1: list[0],
                link2:list[1],
                link3:list[2],
               

            })
        })()
    } catch (err) {
        console.error(err);
    }

   
})


module.exports = router;