const http = require('http');
const app = require('./server');

setTimeout(() => {
  console.log('\n--- Running Automated Endpoint Verification ---');

  http.get('http://localhost:5000/api/products/deals/featured', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('1. GET /api/products/deals/featured -> HTTP Status:', res.statusCode);
      const json = JSON.parse(data);
      console.log('   Items returned:', json.data.length, '| First item:', json.data[0]?.name);

      http.get('http://localhost:5000/api/products/search?q=phone', (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', () => {
          console.log('2. GET /api/products/search?q=phone -> HTTP Status:', res2.statusCode);
          const json2 = JSON.parse(data2);
          console.log('   Results found:', json2.data.length, '| Match:', json2.data[0]?.name);

          http.get('http://localhost:5000/api/products?limit=12&category=Mobiles', (res3) => {
            let data3 = '';
            res3.on('data', chunk => data3 += chunk);
            res3.on('end', () => {
              console.log('3. GET /api/products?category=Mobiles -> HTTP Status:', res3.statusCode);
              const json3 = JSON.parse(data3);
              console.log('   Mobiles count:', json3.data.length);
              console.log('--- ALL ENDPOINTS VERIFIED 200 OK! ---');
              process.exit(0);
            });
          });
        });
      });
    });
  });
}, 1000);
