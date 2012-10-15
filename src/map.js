var esprima = require('esprima');
var _ = require('underscore');
var reify = require('./reify').reify;
var reifyPattern = require('./reify').pattern;
var transform = require('./transform');
var match = require('./match');

exports.switch = function(ast, pattern, switchAst) {
    ast = reified(ast);
    pattern = reifiedPattern(pattern);
    switchAst = reified(switchAst);

    var s = match(pattern, ast);
    if (!s) return ast;
    return exports.substitute(switchAst, s);
};

function reified(ast) {
    if (ast instanceof Function)
	return reify(ast);
    return ast;
}

function reifiedPattern(ast) {
    if (ast instanceof Function)
	return reifyPattern(ast);
    return ast;
}

exports.map = function(ast, pattern, mapper) {
    ast = reified(ast);
    pattern = reifiedPattern(pattern);

    var s = match(pattern, ast);
    if (!s) return ast;
    for(var k in s) {
	if(mapper && mapper[k]) {
	    s[k] = mapper[k](s[k]);
	}
    }
    return exports.substitute(pattern, s);
};

exports.substitute = function(onto, subst) {
    onto = reified(onto);
    return transform(onto
		     , function(ast) {
			 if (ast.type !== 'Splice' &&
			     ast.type !== 'SpliceList' &&
                             ast.type !== 'SpliceLocation')
			     return ast;

                         if(ast.type === 'SpliceLocation') {
                             if(subst.loc[ast.splice] === undefined)
                                 throw new Error('Nonexisting location splice ' +
                                                 ast.splice + ' in ' +
                                                 JSON.stringify(subst, null, 4));
                             return subst.loc[ast.splice];
                         }

			 var splice = reified(subst[ast.splice]);
			 if (splice === undefined) {
			     throw new Error('Nonexisting splice: '
					     + ast.splice + ' in ' +
					     JSON.stringify(subst, null, 4));
			 }
			 return splice;
		     });
};