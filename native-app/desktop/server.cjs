const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
function createServer(root, port) {
  return http.createServer((req,res)=>{
    if(req.headers.host!==`127.0.0.1:${port}` || !['GET','HEAD'].includes(req.method)){res.writeHead(403);return res.end();}
    let target;
    try {target=decodeURIComponent(new URL(req.url,'http://localhost').pathname);} catch {res.writeHead(400);return res.end();}
    if(target==='/')target='/index.html';
    const filename=path.resolve(root,'.'+target);
    if(!filename.startsWith(path.resolve(root)+path.sep)){res.writeHead(403);return res.end();}
    fs.stat(filename,(error,stat)=>{
      if(error||!stat.isFile()){res.writeHead(404);return res.end();}
      res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
      if(req.method==='HEAD')return res.end();
      fs.createReadStream(filename).on('error',()=>res.destroy()).pipe(res);
    });
  });
}
module.exports={createServer};
