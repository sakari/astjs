var esprima = require('esprima');
var transform = require('./index').transform;
var _ = require('underscore');

exports.reify = function(fn, opts) {
    var ast = esprima.parse(fn);
    return exports[ast.body[0].id.name](fn, opts);
};

exports.literal = function(value, opts) {
    return exports.expr('function _() {(' + JSON.stringify(value) + ')}', opts);
};

exports.stmt = function(fn, opts) {
    return exports.block(fn, opts)[0];
};

exports.pattern = function(fn, opts) {
    var locIndex = 0;
    var ast = exports.reify(fn, opts);
    return transform(ast, function(ast) {
        if (ast && ast.type &&
            ast.type !== 'Splice' &&
            ast.type !== 'SpliceList') {
            ast = _.extend(ast, {
                loc: {
                    type: 'SpliceLocation',
                    splice: locIndex++
                }});
        }
        return ast;
    });
}

exports.block = function(fn, opts) {
    var ast = esprima.parse(fn, opts || {});
    return transform(ast
		     , function(ast) {
			 var splice;
			 if (ast.type === 'Identifier') {
			     if ( ast.name.match(/^\$\$/)) {
				 splice = {
				     type: 'Identifier',
				     name: ast.name.replace(/^\$\$/, '$')
				 };
			     } else if (ast.name.match(/^\$[0-9]+_?/)) {
				 var m = ast.name.match(/^\$([0-9]+)(_?)/);
				 if (m[2])
				     splice = {
					 type: 'SpliceList',
					 splice: Number(m[1])
				     };
                                 else
				     splice = {
				         type: 'Splice',
				         splice: Number(m[1])
				     };
			     }
			 }
                         if (splice) {
                             if(ast.loc)
                                 splice.loc = ast.loc;
                             return splice;
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

exports.expr = function(fn, opts) {
    var e = exports.stmt(fn, opts);
    return e.expression || e;
};
