const http = require('http');
const url = require('url');
const child = require('child_process');
const { parse } = require('querystring');
var Cookies = require('cookies');
const ls_util = require('../lib/ls');

var keys = ['keyboard cat'];
var auth_name = 'auth';
var auth_age = 3000;

var code = 200;

http.createServer(function(req, res) {
//console.log(JSON.stringify(req.headers));

	var url_parts = url.parse(req.url, true);
	var uri = url_parts.pathname;
	uri.substr(1);
	
	var cookies = new Cookies(req, res, { keys: keys });

	var auth = cookies.get(auth_name, { signed: true });
	var result = '';

	if (uri == '/alive') {
		result='1';
	} else if (uri == '/auth') {
		const b64cred = req.headers.authorization.split(' ')[1];
		const cred = Buffer.from(b64cred, 'base64').toString('ascii');
		const [userid, passwd] = cred.split(':');
		cookies.set(auth_name, userid, { maxAge: auth_age, sameSite: true, signed: true });
	} else if (uri == '/check') {
		result = auth ? auth : '';
	} else if (uri.startsWith('/path')) {
		var org_path = uri.replace(/^\/path/, '').trim();	
		var path=org_path.length ? org_path : '/';
		var user = auth ? auth : '';
		path.replace(/^~([^a-zA-Z])?/,`~${user}${1}`);
		path=ls_util.resolve_loc(path);
		var path_pat=path.replace('/','\\/');
		var path_ex=RegExp(`^${path_pat}`);
		var items = ls_util.complete({userid: user, path: path});
		result = items.map((value) => {
				return value.replace(path_ex, org_path);
			}).join("\n"); 
	} else {
		code=404;
		result='Not supported ' + uri;
	}

	res.writeHead(code, {'Content-type': 'text/plain'});
	res.write(result);
//console.log('Res: ' + result);
	res.end();
}).listen(1234);
