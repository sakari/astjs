var transform = require('../transform');
var should = require('should');

describe('transform', function() {
	     describe('transform', function() {
			 it('transforms ast trees', function() {
				var fn = transform.reify(function _() {
							     var i;
							 });
				transform.transform(fn, 
						    function(ast) {
							if (ast.type !== 'Identifier')
							    return ast;
							return {
							    type: 'Identifier',
							    name: 'mapped_' + ast.name
							};
						    })
				    .declarations[0]
				    .id
				    .name
				    .should
				    .equal('mapped_i');
			    });
		     });

	     describe('reify', function() {
			  it('reifies the body of the argument function to ast',
			     function() {
				 transform.reify(function _() {
						     var i = 1;
						 })
				     .type
				     .should
				     .equal('VariableDeclaration');
			     });
		      });

	     describe('splice', function() {
			  it('splices asts with asts', function() {
				 var fn = transform.reify(function _() {
							      $0;
							  });
				 var arg = transform.reify(function _() {
							       var a = 1;
							   });
				 transform.splice(fn, arg)
				     .should
				     .have
				     .property('type', 'ExpressionStatement');
			     });
			  
			  it('allows escaping $ as $$', function() {
				 var fn = transform.reify(function _() {
							      var $$ = 1;
							  });
				 transform.splice(fn)
				     .declarations[0]
				     .id
				     .name
				     .should
				     .equal("$");
			     });

			  it('throws if trying to splice non existing arg',
			    function() {
				var fn = transform.reify(function _() {
							     $1;
							 });
				(function() {
				    transform.splice(fn);
				}).should.throw();
			    });
		      });
	     
	 });