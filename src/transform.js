module.exports = function(ast, fn) {
    var newAst;
    var r;
    if (typeof ast !== 'object' ||
	!ast)
	return ast;
    if (ast instanceof Array)
	newAst = [];
    else
	newAst = {};
    for(var c in ast) {
        r = module.exports(ast[c], fn);
        if (r !== undefined)
	    newAst[c] = r;
    }
    if (newAst instanceof Array) {
	return fn(Array.prototype.concat.apply([], newAst));
    }
    return fn(newAst);
};