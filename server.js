import {createServer} from 'node:http';
import {readFile,realpath} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css'};
const server=createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');let name=decodeURIComponent(url.pathname);
    if(name==='/')name='/index.html';if(name.endsWith('/'))name+='index.html';
    // Serve only the app entry and frontend, never .git, source credentials, or arbitrary files.
    if(name!=='/index.html'&&!name.startsWith('/frontend/'))throw Error('Not found');
    const target=await realpath(path.resolve(root,'.'+name));
    if(!target.startsWith(root+path.sep)||(target!==path.join(root,'index.html')&&!target.startsWith(path.join(root,'frontend')+path.sep)))throw Error('Not found');
    res.setHeader('Content-Type',types[path.extname(target)]??'application/octet-stream');res.setHeader('X-Content-Type-Options','nosniff');
    res.end(await readFile(target));
  }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(Number(process.env.PORT??8080),'127.0.0.1',()=>console.log('Twin-O-Matic: http://127.0.0.1:'+server.address().port));
