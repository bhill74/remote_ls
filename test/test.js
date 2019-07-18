const util = require('./util');

console.log(`ID ${process.getuid()}`);

console.log("get_home()");
console.log(util.get_home('bhill'));

console.log("get_userid()");
console.log(util.get_userid('bhill'));
console.log(util.get_userid(''));
console.log(util.get_userid('abcd'));

console.log("get_userid_from_uid()");
console.log(util.get_userid_from_uid(100));

console.log("get_uid()");
console.log(util.get_uid('bhill'));
console.log(util.get_uid('daemon'));

console.log("get_grps()");
console.log(util.get_grps('bhill'));
console.log(util.get_grps('daemon'));

console.log("resolve_loc()");
console.log(util.resolve_loc('/home/bhill/TMP/util.sh'));
console.log(util.resolve_loc('~bhill/TMP/util.sh'));
console.log(util.resolve_loc('~/TMP/util.sh'));
console.log(util.resolve_loc('~/TMP/util'));

console.log("parse_args()");
console.log(util.parse_args({}));
console.log(util.parse_args({brian: 'hill'}));
console.log(util.parse_args({userid: 'daemon'}));
console.log(util.parse_args({userid: 'games', test: 3, sample: 'unknown'}));

console.log("resolve_path()");
console.log(util.resolve_path({path: '/home/bhill/TMP/AA'}));

console.log("resolve_file()");
console.log(util.resolve_file({file: '/home/bhill/TMP/util.sh'}));

console.log("resolve_files()");
console.log(util.resolve_files({files: ['/home/bhill/TMP/util.sh', '/home/bhill/TMP/util.js', '/home/bhill/TMP/abcd.js']}));

console.log("validate_passwd");
console.log(util.validate_passwd('bhill', 'abcd1974'));
console.log(util.validate_passwd('bhill', 'abcd1234'));
