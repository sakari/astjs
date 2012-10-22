var esprima = require('esprima');
var transform = require('./index').transform;
var _ = require('underscore');

function reify(opts) {
    this._opts = opts || {};
}
module.exports = new reify();

reify.prototype.defaults = function(opts) {
    return new reify(opts);
}

reify.prototype.reify = function(fn, opts) {
    var ast = esprima.parse(fn);
    return this[ast.body[0].id.name](fn, opts);
};

reify.prototype.literal = function(value, opts) {
    return this.expr('function _() {(' + JSON.stringify(value) + ')}', opts);
};

reify.prototype.stmt = function(fn, opts) {
    return this.block(fn, opts)[0];
};

reify.prototype.pattern = function(fn, opts) {
    var locIndex = 0;
    var ast = this.reify(fn, opts);
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

reify.prototype.block = function(fn, opts) {
    var ast = esprima.parse(fn, _.extend({}, this._opts, opts));
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

reify.prototype.expr = function(fn, opts) {
    var e = this.stmt(fn, opts);
    return e.expression || e;
};
