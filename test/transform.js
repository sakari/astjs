var transform = require('../src').transform;
var reify = require('../src').reify.reify;

describe('.transform', function() {
	     it('transforms ast trees', function() {
		    var fn = reify(function stmt() {
					    var i;
					});
		    transform(fn, 
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
		    transform(p, function(ast) {
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
