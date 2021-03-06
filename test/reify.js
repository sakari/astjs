var should = require('should');
var reify = require('../src').reify;
var escodegen = require('escodegen');
var util = require('util');

describe('reify', function() {
	     describe('shorthand', function() {
			  it('can be used be giving a name to the function'
			    , function() {
				reify.reify(function stmt() { var a; })
				    .should
				    .eql(reify.stmt(function _() {
							var a;
						    }));
				reify.reify(function block() { var a; })
				    .should
				    .eql(reify.block(function _() {
							var a;
						    }));
				reify.reify(function expr() { a; })
				    .should
				    .eql(reify.expr(function _() {
							a;
						    }));
			    });
		      });

	     describe('literal', function() {
			  function evalValue(str) {
			      return eval('(' + str + ')');
			  }

			  it('converts literals to ast form'
			    , function() {
				evalValue(escodegen.generate(
					      reify.literal({a: 1})
					  ))
				    .should
				    .eql({a: 1});
			    });
		      });

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

			  it('adds location info if requested', function() {
				 reify.block(function _() {
				     var a;
				     var b;
				 }, {loc: true})[0]
                                  .loc
                                  .start.line
                              	  .should
				  .equal(2);
			     });

			  it('unescapes $$ as $', function() {
				 reify.block(function _() {
						 $$;
					     })[0]
				     .expression
				     .name
				     .should
				     .equal("$");
			     });

			  it('Converts $N to splice in statement', function() {
				 reify.block(function _() {
						 $1;
					     })[0]
				     .should
				     .eql({
					      type: 'Splice',
					      splice: 1
					  });
			     });
			  it('Converts $N to splice in init for for', function() {
				 reify.block(function _() {
						 for($1;;);
					     })[0]
				     .init
				     .should
				     .eql({
					      type: 'Splice',
					      splice: 1
					  });
			     });


			  it('Converts $N_ to splice list', function() {
				 reify.block(function _() {
						 $1_;
					     })[0]
				     .should
				     .eql({
					      type: 'SpliceList',
					      splice: 1,
					  });
			     });

			  it('Converts $N to splice in identifier', function() {
				 reify.block(function _() {
						 var $1;
					     })[0]
				     .declarations[0]
				     .id
				     .should
				     .eql({
					      type: 'Splice',
					      splice: 1
					  });
			     });

			  it('Converts $N_ to splice lists identifier', function() {
				 reify.block(function _() {
						 var $1_;
					     })[0]
				     .declarations[0]
				     .id
				     .should
				     .eql({
					      type: 'SpliceList',
					      splice: 1,
					  });
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