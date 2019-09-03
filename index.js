const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

///////////////////////////////////////////////
// FILES

// Blocking, syncronous way
// const inputTxt = fs.readFileSync('./txt/input.txt', 'utf-8')
// console.log(inputTxt)

// const outputTxt = `This is what we know about avocardo: ${inputTxt}.\nCreated At: ${Date.now()}`
// fs.writeFileSync('./txt/output.txt', outputTxt)
// console.log('File Written');

// Non-Blocking, asyncronous way

// fs.readFile('./txt/start.txt', (err, data) => {
//     if(err) return console.log('wrong file name')
//     fs.readFile(`./txt/${data}.txt`, (err, data2) => {
//         fs.readFile(`./txt/append.txt`, (err, data3) => {
//             let newData = data2 + '\n' + data3
//             fs.writeFile('./txt/end.txt', newData, ((err) => {
//                 console.log('new file written')
//             }))
//         })
//     })
// })

///////////////////////////////////////////////
// SERVER

const templateOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const templateCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const templateProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map(el => slugify(el.productName, { lower: true }));
// console.log(slugs)

const app = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);
  // console.log(pathname);

  // OVERVIEW PAGE
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });

    const cardHtml = dataObj
      .map(el => replaceTemplate(templateCard, el))
      .join('');
    const output = templateOverview.replace('{% PRODUCT_CARDS %}', cardHtml);

    res.end(output);
  }

  // PRODUCTS PAGE
  else if (pathname === '/product') {
    const productId = query.slug.split('-').pop();
    const product = dataObj[productId];
    const output = replaceTemplate(templateProduct, product);

    res.end(output);
  }

  // API PAGE
  else if (pathname === '/api') {
    res.writeHead(200, {
      'Content-type': 'application/json'
    });
    res.end(data);
  }

  // NOT FOUND PAGE
  else {
    res.writeHead(404, {
      'Content-Type': 'text-html',
      'my-own-header': 'hello-world'
    });
    res.end('<h1>Page Not Found</h1>');
  }
});

app.listen(8000, () => {
  console.log('Listening to the port 8000');
});
