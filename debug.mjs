import fs from 'fs';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable"
});

dom.window.onerror = function (msg, url, line, col, error) {
    console.error("DOM ERROR:");
    console.error(msg);
    if(error) {
       console.error(error.stack);
    }
};

setTimeout(() => {
    console.log("Checking completed.");
}, 3000);
