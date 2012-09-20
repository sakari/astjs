var esprima = require('esprima');

function spliceIdentifier(ast, args) {
    if (ast.type !== 'SpliceIdentifier')
	return ast;
    if(ast.splice >= args.length)
	throw new Error('Non existing splice');
    return args[ast.splice];
}

function spliceStatement(ast, args) {
   if(ast.splice >= args.length)
	throw new Error('Non existing splice');
    var splice = args[ast.splice];
    if (!(splice instanceof Array))
	splice = [splice];

    splice.forEach(function(s) {
		       if (s.type !== 'ExpressionStatement' &&
			   s.type !== 'VariableDeclaration' &&
			   s.type !== 'SpliceStatement')
			   throw new Error('Expected a statement for splice');
		   });
    return splice;
}

exports.splice = function(onto) {
    var args = [];
    for (var i = 1; i < arguments.length; i++) {
	args.push(arguments[i]);
    }
    return exports.transform(onto
			     , function(ast) {
				 if (ast.type === 'SpliceStatement')
				     return spliceStatement(ast, args);
				 return spliceIdentifier(ast, args);
	     });
};

exports.transform = function(ast, fn) {
    var newAst;
    if (typeof ast !== 'object' || 
	!ast)
	return ast;
    if (ast instanceof Array)
	newAst = [];
    else
	newAst = {};
    for(var c in ast) {
	newAst[c] = exports.transform(ast[c], fn);
    }
    if (newAst instanceof Array) {
	return fn(Array.prototype.concat.apply([], newAst));
    }
    return fn(newAst);
};