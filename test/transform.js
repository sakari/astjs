var transform = require('../transform');
var should = require('should');

describe('transform', function() {
	     describe('transform', function() {
			  it('transforms ast trees', function() {
				 var fn = transform.reifyStmt(function _() {
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

			  it('flattens transfrom results in lists', function() {
				 var p = [{ type: 'T'}, { type: 'K'}];
				 transform.transform(p, function(ast) {
							 if(ast.type === 'T')
							     return [1, 2];
							 if(ast.type === 'K')
							     return 3;
							 return ast;
						     })
				     .should
				     .eql([1, 2, 3]);
			     });
		      });

	     describe('reifyBlock', function() {
			  it('reifies statement blocks', function() {
				 transform.reifyBlock(function _() {
							  var a;
							  var b;
						      })
				     .length
				     .should
				     .equal(2);
			     });
		      });

	     describe('reifyExpr', function() {
			  it('reifies expression', function() {
				 transform.reifyExpr(function _() {
							 a + i;
						     })
				     .type
				     .should
				     .equal('BinaryExpression');
			     });
		      });

	     describe('reifyStmt', function() {
			  it('reifies single statement of the argument function to ast',
			     function() {
				 transform.reifyStmt(function _() {
							 var i = 1;
						     })
				     .type
				     .should
				     .equal('VariableDeclaration');
			     });
		      });

	     describe('splice', function() {
			  it('splices a single statement to a block', 
			     function() {
				 var fn = transform.reifyBlock(function _() {
								   $0;
								   var c;
							       });

				 var stmt = transform.reifyStmt(function _() {
								    var a;
								});

				 var expected = transform.reifyBlock(function _() {
									 var a;
									 var c;
								     });
				 var got = transform.splice(fn, stmt);
				 got.should.eql(expected);
			     });

			  it('splices a list of statements to a block', 
			     function() {
				 var fn = transform.reifyBlock(function _() {
								   $0;
								   var c;
							       });
				 var block  = transform.reifyBlock(function _() {
								    var a;
								    var b;
								});
				 var expected = transform.reifyBlock(function _() {
									 var a;
									 var b;
									 var c;
								     });
				 var got = transform.splice(fn, block);
				 got.should.eql(expected);
			     });

			  it('splices a statements and blocks to a block', 
			     function() {
				 var fn = transform.reifyBlock(function _() {
								   $0;
								   var c;
								   $1;
							       });

				 var block  = transform.reifyBlock(function _() {
								    var a;
								    var b;
								});

				 var stmt = transform.reifyStmt(function _() {
								    var d;
								});

				 var expected = transform.reifyBlock(function _() {
									 var a;
									 var b;
									 var c;
									 var d;
								     });
				 var got = transform.splice(fn, block, stmt);
				 got.should.eql(expected);
			     });

			  
			  it('allows escaping $ as $$', function() {
				 var fn = transform.reifyStmt(function _() {
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
				 var fn = transform.reifyStmt(function _() {
								  $1;
							      });
				 (function() {
				      transform.splice(fn);
				  }).should.throw();
			     });
		      });
	     
	 });