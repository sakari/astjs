var transform = require('../src').transform;
var reify = require('../src').reify;
var util = require('util');
var should = require('should');

describe('transform', function() {
	     describe('.match', function() {

			  it('return null if ast does not match', 
			    function() {
				should.strictEqual(
				    transform.match(reify.stmt(function _() {
								   var b;
							       }
							       , reify.stmt(function _() {
										var a;
									    })))
				    , null);
			    });
			  it('returns an empty substitution if it matches without variable', function() {
				 var template = reify.stmt(function _() {
							       var b;
							   });
				 var matchee = reify.stmt(function _() {
							      var b;
							  });
				 transform.match(template, matchee)
				     .should
				     .eql([]);
			     });

			  it('returns a substitution if it matches', function() {
				 var template = reify.stmt(function _() {
							       var $0;
							   });
				 var matchee = reify.stmt(function _() {
							      var b;
							  });
				 var subst = transform.match(template, matchee);
				 transform.substitute(template
						      , subst)
				     .should
				     .eql(matchee);
			     });

			  it('matches multiple occurrences with the same substitution', function() {
				 var template = reify.block(function _() {
								var $0;
								$0 = 1;
							   });
				 var matchee = reify.block(function _() {
							       var b;
							       b = 1;
							   });
				 var subst = transform.match(template, matchee);
				 transform.substitute(template
						      , subst)
				     .should
				     .eql(matchee);
			     });

			  it('returns null if required substitutions are not equal', function() {
				 var template = reify.block(function _() {
								var $0;
								$0 = 1;
							   });
				 var matchee = reify.block(function _() {
							       var b;
							       c = 1;
							   });
				 should.strictEqual(transform.match(template, matchee), null);
			     });

			  it('matches expressions', function() {
				 var template = reify.stmt(function _() {
							       var a = $0;
							   });
				 var matchee = reify.stmt(function _() {
							      var a = 1 + k();
							  });
				 var subst = transform.match(template, matchee);
				 transform.substitute(template
						      , subst)
				     .should
				     .eql(matchee);
			     });

			  it('matches many statements', function() {
				 var template = reify.block(function _() {
							       $0_;
							   });
				 var matchee = reify.block(function _() {
							      var a;
							      var b;
							  });
				 var subst = transform.match(template, matchee);
				 transform.substitute(template
						      , subst)
				     .should
				     .eql(matchee);
			     });

			  it('matches statements as far as possible', function() {
				 var template = reify.block(function _() {
								$0_;
								var a;
							   });
				 var matchee = reify.block(function _() {
							       var a;
							       var a;
							       var a;
							  });
				 var subst = transform.match(template, matchee);
				 subst[0]
				     .should
				     .eql(reify.block(function _() {
							  var a;
							  var a;
						      }));
			     });

			  it('matches greedily', function() {
				 var template = reify.block(function _() {
								$0_;
								$1_;
							   });
				 var matchee = reify.block(function _() {
							       var a;
							       var a;
							  });
				 var subst = transform.match(template, matchee);
				 subst[0].length.should.eql(2);
				 subst[1].should.eql([]);
			     });


			  it('matches zero statements', function() {
				 var template = reify.block(function _() {
								$0_;
								var a;
							   });
				 var matchee = reify.block(function _() {
							       var a;
							  });
				 var subst = transform.match(template, matchee);
				 subst[0].should.eql([]);
			     });

			  it('matches argument lists', function() {
				 var template = reify.block(function _() {
								function a($0_) {
								}
							   });
				 var matchee = reify.block(function _() {
							       function a(m, k) {
							       }
							  });
				 var subst = transform.match(template, matchee);
				 subst[0].length.should.eql(2);
				 transform.substitute(template
						      , subst)
				     .should
				     .eql(matchee);
			     });

			  it('matches apply lists', function() {
				 var template = reify.block(function _() {
								a($0_, $1);
							   });
				 var matchee = reify.block(function _() {
							       a(1, a, k(), 1 + 2);
							  });
				 var subst = transform.match(template, matchee);
				 transform.substitute(template
						      , subst)
				     .should
				     .eql(matchee);
			     });
		      });

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
			  it('splices an expression', 
			     function() {
				 var fn = reify.block(function _() {
								   var a = $0;
							       });
				 var expr = reify.expr(function _() {
							  1 + k();
						       });
				 var expected = reify.block(function _() {
								var a = 1 + k();
							    });
				 var got = transform.splice(fn, expr);
				 got.should.eql(expected);
			     });

			  it('splices an identifier', 
			     function() {
				 var fn = reify.block(function _() {
								   var $0;
							       });
				 var expr = reify.expr(function _() {
							  a;
						       });
				 var expected = reify.block(function _() {
								var a;
							    });
				 var got = transform.splice(fn, expr);
				 got.should.eql(expected);
			     });

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