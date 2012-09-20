var should = require('should');
var reify = require('../reify');

describe('reify', function() {
	     describe('.block', function() {
			  it('reifies statement blocks', function() {
				 reify.block(function _() {
							  var a;
							  var b;
						      })
				     .length
				     .should
				     .equal(2);
			     });
		      });

	     describe('.expr', function() {
			  it('reifies expression', function() {
				 reify.expr(function _() {
							 a + i;
						     })
				     .type
				     .should
				     .equal('BinaryExpression');
			     });
		      });

	     describe('.stmt', function() {
			  it('reifies single statement of the argument function to ast',
			     function() {
				 reify.stmt(function _() {
							 var i = 1;
						     })
				     .type
				     .should
				     .equal('VariableDeclaration');
			     });
		      });
	 });