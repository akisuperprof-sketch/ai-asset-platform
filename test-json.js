const { NextResponse } = require('next/server');
try {
  let a = {};
  a.b = a;
  JSON.stringify(a);
} catch(e) {
  console.log(e.message);
}
