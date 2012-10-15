var esprima = require('esprima');
var _ = require('underscore');
var util = require('util');
var reify = require('./reify').reify;
var transform = require('./transform');

function containsSplices(ast) {
    var contains;
    transform(ast,
	      function(i) {
		  if(i && (i.type === 'Splice' ||
			   i.type === 'SpliceList'))
		      contains = true;
	      }
	     );
    return contains;
}

function matchInvariant(ast) {
    if(containsSplices(ast))
	throw new Error('match contains splices');
    return ast;
}

function spliceInvariant(subst) {
    if (!subst) return subst;
    for(var k in subst) {
	if(containsSplices(subst[k]))
	    throw new Error();
    }
    return subst;
}

function matchGreedily(pattern, match, substitution) {
    var subst;
    var restOfPattern = _.rest(pattern);
    var spliceId = pattern[0].splice;

    for(var i = match.length; i >= 0; i--) {
	subst = _.clone(substitution);
	subst[spliceId] = _.first(match, i);
	subst = matchArray(restOfPattern
			   , _.rest(match, i)
			   , subst);
	if (subst) {
	    return subst;
	}
    }
    return null;
}

function matchArray(pattern, match, substitution) {
    var spliceAst;
    if(!(match instanceof Array))
	return null;

    if(pattern.length === 0) {
	if (match.length === pattern.length) {
	    return substitution;
	}
	return null;
    }

    if(pattern[0].type === 'SpliceList') {
	spliceAst = substitution[pattern[0].splice];
	if (spliceAst !== undefined)
	    return matchArray(spliceAst
			      .concat(_.rest(pattern))
			      , match
			      , substitution);
	return matchGreedily(pattern
			     , match
			     , substitution);
    }
    substitution = module.exports(pattern[0]
				  , match[0]
				  , substitution);
    if (substitution) {
	return module.exports(_.rest(pattern)
			      , _.rest(match)
			      , substitution);
    }
    return null;
};

function matchObject(pattern, match, substitution) {
    if(!(match instanceof Object) && match !== null)
	return null;

    if (pattern && pattern.type === 'SpliceLocation') {
        substitution.loc = substitution.loc || {};
        substitution.loc[pattern.splice] = match;
        return substitution;
    }
    if (match && match.start && match.start.line)
        return substitution;

    if(pattern.type == 'Splice' ||
       pattern.type == 'SpliceList') {
	if (!substitution[pattern.splice]) {
	    substitution[pattern.splice] = match;
	    spliceInvariant(substitution);
	    return substitution;
	}
	return module.exports(substitution[pattern.splice], match, substitution);
    }

    if (pattern === undefined ||
	pattern === null ||
	match === undefined ||
	match === null)
	return null;
    for(var k in pattern) {
	substitution = module.exports(pattern[k], match[k], substitution);
	if(!substitution) {
	    return null;
	}
    }
    return substitution;
}

module.exports = function(pattern, match, substitution) {
    matchInvariant(match);
    substitution = substitution || {};
    var subst;

    if (pattern instanceof Array) {
	subst = matchArray(pattern, match, substitution);
    } else if (pattern instanceof Object) {
	subst = matchObject(pattern, match, substitution);
    } else if (pattern === match) {
	subst = substitution;
    }

    if (subst) {
	// console.log("Unify:\n" + JSON.stringify({
	// 					    pattern: pattern,
	// 					    match: match,
	// 					    substitution: subst
	// 					}, null, 4));
	return subst;
    }
    // console.log('No unification for:' + JSON.stringify({
    // 							   pattern: pattern,
    // 							   match: match,
    // 							   substitution: subst
    // 						       }, null, 4));
    return null;
};
