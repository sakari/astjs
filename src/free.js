
var transform = require('./index').transform;

exports.all = function(ast) {
    var identifiers = {};
    transform.transform(ast, function(ast) {
			    if (ast.type === 'Identifier')
				identifiers[ast.name] = 1;
			    return ast;
			});
    return identifiers;
};

exports.fresh = function(used) {
    for (var i = 0; used["_" + i]; i++ ) {}
    used['_' + i] = 1;
    return {
	type: 'Identifier',
	name: "_" + i
    };
};