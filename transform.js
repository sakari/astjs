var esprima = require('esprima');

exports.reify = function(fn) {
    var ast = esprima.parse(fn);
    return ast.body[0].body.body[0];
};

exports.splice = function(onto) {
    var args = [];
    for (var i = 1; i < arguments.length; i++) {
	args.push(arguments[i]);
    }
    return exports.transform(onto
			     , function(ast) {
				 if (ast.type !== 'Identifier')
				     return ast;
				 if (ast.name.match(/^\$\$/))
				     return {
					 type: 'Identifier',
					 name: ast.name.replace(/^\$\$/, '$')
				     };
				 if(!ast.name.match(/^\$([0-9]+)/))
				     return ast;
				 var index = ast.name.match(/^\$([0-9]+)/)[1];
				 if(index >= args.length)
				     throw new Error('Non existing splice');
				 return args[index];
		
	     });
};

exports.transform = function(ast, fn) {
    var newAst;
    if (typeof ast !== 'object' || !ast)
	return ast;
    if (ast instanceof Array)
	newAst = [];
    else
	newAst = {};
    for(var c in ast) {
	newAst[c] = exports.transform(ast[c], fn);
    }
    return fn(newAst);
};