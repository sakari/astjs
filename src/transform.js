module.exports = function(ast, fn) {
    var newAst;
    if (typeof ast !== 'object' ||
	!ast)
	return ast;
    if (ast instanceof Array)
	newAst = [];
    else
	newAst = {};
    for(var c in ast) {
	newAst[c] = module.exports(ast[c], fn);
    }
    if (newAst instanceof Array) {
	return fn(Array.prototype.concat.apply([], newAst));
    }
    return fn(newAst);
};