var esprima = require('esprima');
var transform = require('./transform');

exports.reify = function(fn) {
    var ast = esprima.parse(fn);
    return exports[ast.body[0].id.name](fn);
};

exports.stmt = function(fn) {
    return exports.block(fn)[0];
};

exports.block = function(fn) {
    var ast = esprima.parse(fn);
    return transform.transform(ast
			       , function(ast) {
				   if (ast.type === 'Identifier') {
				       if ( ast.name.match(/^\$\$/)) {
					   return {
					       type: 'Identifier',
					       name: ast.name.replace(/^\$\$/, 
								      '$')
					   };
				       }
				       if (ast.name.match(/^\$[0-9]+/)) {
					   return {
					       type: 'SpliceIdentifier',
					       splice: Number(ast.name.replace(/^\$/, ''))
					   };
				       }
				   }
				   if (ast.type === 'ExpressionStatement' &&
				       ast.expression.type == 'SpliceIdentifier') {
				       return {
					   type: 'SpliceStatement',
					   splice: ast.expression.splice
				       };
				   }
				   return ast;
			       })
	.body[0].body.body;
};

exports.expr = function(fn) {
    return exports.stmt(fn).expression;
};
