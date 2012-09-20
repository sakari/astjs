var esprima = require('esprima');

function matchArray(pattern, match, substitution) {
    if(!(match instanceof Array))
	return null;
    if (pattern.length !== match.length)
	return null;
    for(var i in pattern) {
	if(!exports.match(pattern[i], match[i], substitution))
	    return null;
    }
    return substitution;
};

function matchObject(pattern, match, substitution) {
    if(!(match instanceof Object))
	return null;

    if(pattern.type == 'SpliceStatement' ||
       pattern.type == 'SpliceIdentifier') {      
	if (!substitution[pattern.splice]) {
	    substitution[pattern.splice] = match;
	    return substitution;
	}
	return exports.match(substitution[pattern.splice], match, substitution);
    }

    if (pattern === undefined ||
	pattern === null ||
	match === undefined ||
	match === null)
	return null;
    for(var k in pattern) {
	if(!exports.match(pattern[k], match[k], substitution)) {
	    return null;
	}
    }
    return substitution;
}

exports.match = function(pattern, match, substitution) {
    substitution = substitution || {};

    if (pattern instanceof Array)
	return matchArray(pattern, match, substitution);
    if (pattern instanceof Object)
	return matchObject(pattern, match, substitution);
    if (pattern === match)
	return substitution;
    return null;
};

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

exports.substitute = function(onto, subst) {
    return exports.transform(onto
			     , function(ast) {
				 if (ast.type === 'SpliceStatement')
				     return spliceStatement(ast, subst);
				 return spliceIdentifier(ast, subst);
			     });

};

exports.splice = function(onto) {
    var args = {};
    for (var i = 1; i < arguments.length; i++) {
	args[i - 1] = arguments[i];
    }
    return exports.substitute(onto, args);
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