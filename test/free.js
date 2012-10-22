var should = require('should');
var reify = require('../src').reify;
var free = require('../src').free;

describe('free', function(){
	     describe('all', function() {
			  it('it returns all identifiers in given ast'
			     , function() {
				 free.all(reify.reify(function block() {
						    var b;
						    a = c + 1;
						    function c() {
							d;
						    };
						}))
				     .should
				     .eql({a: 1, b: 1, c: 1, d: 1});
			     });
		      });

	     describe('fresh', function() {
			  it('returns a fresh identifier'
			    , function() {
				free.fresh(free.all(reify.reify(function block() {
							       var _0;
							   })))
				    .should
				    .eql({
					     type: 'Identifier',
					     name: '_1'
					 });
			    });
			  it('adds itself to the set of used ids', function() {
				 var used = free.all(reify.reify(function block() {
							       var _0;
							   }));
				 free.fresh(used);
				 should.strictEqual(used._1, 1);
			     });
		      });
	 });