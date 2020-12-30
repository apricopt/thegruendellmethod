const puppeteer = require("puppeteer");

try {
  (async () => {
    /** by default puppeteer launch method have headless option true*/
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
   
    for(var i = 0 ; i<10 ; i++) {
   
    await page.goto("localhost:5000/register");
    await page.type('input[aria-label="firstName"]', "asad");
    await page.type('input[aria-label="lastName"]', "hashmi");
    await page.type('input[aria-label="email"]', "asad@gmail.com");
    await page.type('input[aria-label="password"]', "abc");
    await page.type('input[aria-label="phone"]', "324325235");
    await page.keyboard.press("Enter");

    /** waitfor while loding the page, otherwise evaulate method will get failed. */
    await page.waitFor(2000);
    }
    
    await browser.close();
  })();
} catch (err) {
  console.error(err);
}
