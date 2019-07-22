// util.js
// =======

var execSync = require('child_process').execSync;
const fs = require('fs');
//const passwd = require('passwd-linux');

function system_get(cmd) {
	return execSync(cmd, { encoding: 'utf-8' } );
}

function system_get_merge(cmd) {
	return system_get(cmd).replace(/[\n\r]+/g, '');
}

function get_userid_from_uid(user) {
	return system_get_merge(`getent passwd ${user} | cut -f1 -d:`);
}

function get_uid(user) {
	return parseInt(system_get_merge(`id -u ${user}`));
}

function get_grps(user) {
	return system_get_merge(`id -G ${user}`).split(/ /).map( Number );
}

function parse_args(input) {
	var args = { userid: process.env.USER,
		     uid: get_uid(process.env.USER),
		     grpids: get_grps(process.env.USER),
		     mode: 4,
	             cwd: process.env.PWD };
	Object.keys(input).forEach((key, index) => {
		if (key == 'userid') {
			args.userid = input[key];
			args.uid = get_uid(args.userid);
			args.grpids = get_grps(args.uid);
		} else if (key == 'uid') {
			args.uid = input[key];
			args.userid = get_userid_from_uid(args.uid);
			args.grpids = get_grps(args.uid);
		} else {
			args[key] = input[key]; 
		}
	});
	return args;
}

function resolve_loc(loc) {
	var dirs = loc.split(/\//);
	if (dirs.length == 1) {
		if (loc.match(/^~/)) {
			return system_get_merge(`cd $loc && pwd`);
		}
		dirs.unshift('.');
	}
	var path=dirs.slice(0,dirs.length-1).join('/');
	path=system_get_merge(`cd ${path} && pwd`);
	return `${path}/${dirs[dirs.length-1]}`;
}

function resolve_path(args) {
	args = parse_args(args);

	var spec='';
	args.path.split(/\//).filter((value) => {
		return value != '';
	}).some((value) => {
		spec=`${spec}/${value}`;
		if (fs.existsSync(spec) == false) {
			return true;
		} 
		var stats = fs.statSync(spec);
		if (stats.isDirectory() == false) {
			return true;
		}

		var mode = stats.mode >> 6;
		if ((mode & 1) && stats.uid == args.uid) {
			return false;
		}

		mode = stats.mode >> 3;
		if ((mode & 1) && args.grpids.includes(stats.gid)) {
			return false;
		}

		mode = stats.mode;
		if ((mode & 1)) {
			return false;
		}

		return true;
	});

	return spec;
}

function resolve_file(args) {
	args = parse_args(args);
	if (fs.existsSync(args.file) == false) {
		return '';
	}

	var stats = fs.statSync(args.file);

	var mode = stats.mode >> 6;
	if ((mode & args.mode) && stats.uid == args.uid) {
		return args.file;
	}
	
	mode = stats.mode >> 3;
	if ((mode & args.mode) && args.grpids.includes(stats.gid)) {
		return args.file;
	}

	if ((stats.mode & args.mode)) {
		return args.file;
	}

	return '';
}

function resolve_files(args) {
	args = parse_args(args);

	return args.files.filter((value) => {
		var file_args = args;
		file_args['file'] = value;
		return (resolve_file(file_args) != '');
	});
}

function complete(args) {
	args = parse_args(args);
console.log(args);

	args.files = system_get(`ls -d ${args.path}*`).split(/\n/).filter((value) => {
		return value.length != 0;
	});
	return args.files;
	return resolve_files(args);
}
	
module.exports = {
	get_home: function(user) {
		return system_get(`cd ~${user} && pwd`);
	},

	get_userid: function(user) {
		return ( user == '' ) ? process.env.USER : user;
	},

	get_userid_from_uid: get_userid_from_uid,
	get_uid: get_uid,
	get_grps: get_grps,
	resolve_loc: resolve_loc,
	parse_args: parse_args,
	resolve_path: resolve_path,
	resolve_file: resolve_file,
	resolve_files: resolve_files,
	complete: complete
};
