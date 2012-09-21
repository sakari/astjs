var esprima = require('esprima');
var _ = require('underscore');
var util = require('util');

function matchGreedily(pattern, match, substitution) {
    var subst;
    var restOfPattern = _.rest(pattern);
    var spliceId = pattern[0].splice;

    for(var i = match.length; i >= 0; i--) {
	subst = _.clone(substitution);
	subst[spliceId] = _.first(match, i);
	subst = matchArray(restOfPattern
			   , _.rest(match, i)
			   , subst);
	if (subst) {
	    console.log('matched: ' + util.inspect(subst, false, 10));
	    return subst;
	}
    }
    return null;
}

function matchArray(pattern, match, substitution) {
    var spliceAst;
    if(!(match instanceof Array))
	return null;

    if(pattern.length === 0) {
	if (match.length === pattern.length)
	    return substitution;
	return null;
    }
    
    if(pattern[0].type === 'SpliceList') {
	spliceAst = substitution[pattern[0].splice]; 
	if (spliceAst !== undefined)
	    return matchArray(spliceAst
			      .concat(_.rest(pattern))
			      , match
			      , substitution);
	return matchGreedily(pattern
			     , match
			     , substitution);
    }
    substitution = exports.match(pattern[0]
				 , match[0]
				 , substitution);
    if (substitution) {
	return exports.match(_.rest(pattern)
			     , _.rest(match)
			     , substitution);
    }
    return null;
};

function matchObject(pattern, match, substitution) {
    if(!(match instanceof Object))
	return null;

    if(pattern.type == 'Splice' ||
       pattern.type == 'SpliceList') {      
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
	substitution = exports.match(pattern[k], match[k], substitution); 
	if(!substitution) {
	    return null;
	}
    }
    return substitution;
}

exports.match = function(pattern, match, substitution) {
    substitution = substitution || {};
    var subst;

    if (pattern instanceof Array) {
	subst = matchArray(pattern, match, substitution);
    } else if (pattern instanceof Object) {
	subst = matchObject(pattern, match, substitution);
    } else if (pattern === match) {
	subst = substitution;
    }

    if (subst) {
	console.log("Unify:\n" + JSON.stringify({
						    pattern: pattern,
						    match: match,
						    substitution: subst
						}, null, 4));
	return subst;
    }
    console.log('No unification');
    return null;
};

exports.substitute = function(onto, subst) {
    return exports.transform(onto
			     , function(ast) {
				 if (ast.type !== 'Splice' &&
				     ast.type !== 'SpliceList' )
				     return ast;
				 var splice = subst[ast.splice];
				 if (splice === undefined) {
				     throw new Error('Nonexisting splice: ' 
						     + ast.splice);
				 }
				 return splice;
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