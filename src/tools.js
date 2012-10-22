var transform = require('./transform');
var map = require('./map');
var reify= require('./reify');

exports.simplify = function(ast) {
        return exports.hoist(exports.block(ast));
};

exports.hoist = function(ast) {
        function splitDeclarator(decl, vars) {
	    vars.push(map.substitute(
		reify.reify(function stmt(){
		    var $0;
		})
		, {0: decl.id}));
            if(decl.loc)
                vars[vars.length - 1].loc = decl.loc;
	    if (!decl.init)
	        return null;
	    return map.substitute(
	        reify.reify(function expr() {
		    $0 = $1;
		}), {0: decl.id,
		     1: decl.init});
        }

        function handleForDecl(stmt, vars) {
	        if(!stmt ||
	           stmt.type !== 'ForStatement')
	                return stmt;
	        return map.map(stmt
			       , function stmt() {
				   for($0;$1;$2)
				       $4;
			       }
			       , {0: function(ast) {
				       ast = handleVarDecl(ast, vars);
				       if (!ast) return ast;
				       return ast.expression;
			       }});
        }

        function handleVarDecl(stmt, vars) {
	    if(!stmt ||
	       stmt.type !== 'VariableDeclaration')
	        return stmt;
	    var assingments = stmt
	        .declarations
	        .map(function(decl) {
		    return splitDeclarator(decl, vars);
		})
	        .filter(function(x) { return x;});
            var expr = {
                type: 'ExpressionStatement',
            }
            if (stmt.loc)
                expr.loc = stmt.loc;
	    if (assingments.length > 1) {
                expr.expression = {
		    type: 'SequenceExpression',
		    expressions: assingments
		}
	        return expr;
            }
	    if (assingments.length === 1) {
                expr.expression =  assingments[0]
                return expr;
	    }
	    return null;
        }

        return transform(ast, function(ast) {
		if(!(ast instanceof Array))
			return ast;
		var vars = [];
		var stmts = ast.map(
			function(stmt) {
				return handleForDecl(
				        handleVarDecl(stmt, vars)
				        , vars);
			})
			.filter(function(s) { return s; });
		return vars.concat(stmts);
	});
};

exports.block = function(ast) {
        function wrapExpression(block) {

	        if(block.type === 'BlockStatement')
	                return block;
                if (block.loc)
	                return {
	                        type: 'BlockStatement',
	                        body: [ block ],
                                loc: block.loc
	                };
                return {
                        type: 'BlockStatement',
                        body: [ block ]
                };
        }

        function handleIf(ast) {
	        return map.map(ast
		               , function block() {
				   if($0) $1;
			       }
		               ,{ 1: wrapExpression });
        }
        function handleFor(ast) {
	        return map.map(ast
		               ,function block() {
				   for($0;$1;$2) $3;
			       }
		               , { 3: wrapExpression });
        }
        function handleWhile(ast) {
	        return map.map(ast
		               ,function block() {
				   while($0) $1;
			       }
		               ,{ 1: wrapExpression });
        }

        return transform(ast, function(ast) {
		return handleWhile(
			handleFor(
				handleIf(ast)
			));
	});
};