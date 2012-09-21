var esprima = require('esprima');
var transform = require('./index').transform;

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
				   var splice;
				   if (ast.type === 'Identifier') {
				       if ( ast.name.match(/^\$\$/)) {
					   return {
					       type: 'Identifier',
					       name: ast.name.replace(/^\$\$/, 
								      '$')
					   };
				       }
				       if (ast.name.match(/^\$[0-9]+_?/)) {
					   var m = ast.name.match(/^\$([0-9]+)(_?)/);
					   if (m[2])
					       return {
						   type: 'SpliceList',
						   splice: Number(m[1])
					       };
					   return {
					       type: 'Splice',
					       splice: Number(m[1])
					   };
				       }
				   }
				   if (ast.type === 'ExpressionStatement' &&
				       (ast.expression.type == 'Splice' || 
					ast.expression.type == 'SpliceList')) {
				       return ast.expression;
				   }
				   return ast;
			       })
	.body[0].body.body;
};

exports.expr = function(fn) {
    return exports.stmt(fn).expression;
};
