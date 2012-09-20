var transform = require('../transform');
var reify = require('../reify');

var should = require('should');

describe('transform', function() {
	     describe('.transform', function() {
			  it('transforms ast trees', function() {
				 var fn = reify.stmt(function _() {
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

	     describe('.splice', function() {
			  it('splices a single statement to a block', 
			     function() {
				 var fn = reify.block(function _() {
								   $0;
								   var c;
							       });

				 var stmt = reify.stmt(function _() {
								    var a;
								});

				 var expected = reify.block(function _() {
									 var a;
									 var c;
								     });
				 var got = transform.splice(fn, stmt);
				 got.should.eql(expected);
			     });

			  it('splices a list of statements to a block', 
			     function() {
				 var fn = reify.block(function _() {
								   $0;
								   var c;
							       });
				 var block  = reify.block(function _() {
								    var a;
								    var b;
								});
				 var expected = reify.block(function _() {
									 var a;
									 var b;
									 var c;
								     });
				 var got = transform.splice(fn, block);
				 got.should.eql(expected);
			     });

			  it('splices a statements and blocks to a block', 
			     function() {
				 var fn = reify.block(function _() {
								   $0;
								   var c;
								   $1;
							       });

				 var block  = reify.block(function _() {
								    var a;
								    var b;
								});

				 var stmt = reify.stmt(function _() {
								    var d;
								});

				 var expected = reify.block(function _() {
									 var a;
									 var b;
									 var c;
									 var d;
								     });
				 var got = transform.splice(fn, block, stmt);
				 got.should.eql(expected);
			     });
			  
			  it('throws if trying to splice non existing arg',
			     function() {
				 var fn = reify.stmt(function _() {
								  $1;
							      });
				 (function() {
				      transform.splice(fn);
				  }).should.throw();
			     });
		      });
	     
	 });