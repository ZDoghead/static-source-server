// 静态资源服务器
const http = require('http');
const path = require('path');
const fs = require('fs');
const URL = require('url');


/**
 * 处理请求，需要满足以下
 * 请求：http://localhost:15003/index.html -> 返回public/index.html的内容
 * 请求：http://localhost:15003/css/index.css -> 返回public/css/index.css的内容
 * ...
 */

// 得到文件中的内容
async function getFileContent(filename) {
  try {
    let stat = await fs.promises.stat(filename);  // 得到文件状态信息
    if (stat.isFile()) {
      // 是文件，读取内容，并返回    
      return await fs.promises.readFile(filename, 'utf-8');  
    } else {
      // 不是文件，是目录。统一在文件路径后加上/index.html
      // 如：D:\HTMLandCSS\.vscode\NodeJs学习\node练习\http模块搭建服务器\public\css\index.html
      const newFilename = filename + `${path.sep}index.html`;
      return await fs.promises.readFile(newFilename, 'utf-8');  // 存在则返回，不存在则报错被捕获
    }
  } catch (err) {
    return null;  // 没有对应的文件
  }
}

// 获取请求路径
function getReqPath(req) {
  const url = path.join('http://', req.headers['host'], req.url); // 得到一个合法的url
  const urlObj = new URL.URL(url);  // parse已经弃用了
  const reqPath = urlObj.pathname.substr(1);
  return path.resolve(__dirname, 'public', reqPath);
}

// 处理请求和响应
async function handler(req, resp) {
  const reqPath = getReqPath(req);
  const fileContent = await getFileContent(reqPath);  // 得到对应文件内容
  
  // 进行响应
  if (fileContent === null) {
    // 没有对应的文件
    resp.statusCode = 404;
    resp.write(`${fileContent}`);
  } else {
    // 有对应的文件
    const flag = resp.write(fileContent); // 可以进行背压处理
  }
  resp.end();   // 写入结束
}

// 创建一个服务器
const server = http.createServer(handler);

// 当监听端口后触发
server.on('listening', () => {
  console.log('server listen 15003');
})

server.listen(15003);   // 监听一个端口
