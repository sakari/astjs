var astjs = require('./src');
var escodegen = require('escodegen');
var esprima = require('esprima');
var fs = require('fs');

function holes(ast) {
    var hs = [];
    astjs.iterator.visit(ast, {
        pre: function(ast) {
            if(!ast || ast.type !== 'BlockStatement')
                return true;
            hs.push({
                start: ast.loc.start.line,
                end: ast.loc.end.line
            });
        }
    });
    return hs;
}

function covered(ast) {
    var cover = [];
    console.assert(ast.loc, JSON.stringify(ast, null, 4));
    var start = ast.loc.start.line;
    holes(ast).forEach(function(v) {
        cover.push({
            start: start,
            end: v.start,
        });
        start = v.end;
    });
    cover.push({
        start: start,
        end: ast.loc.end.line
    });
    return cover;
}

function coverage(src, cb) {
    fs.readFile(src, 'utf8', function(err, contents) {
        if(err) return cb(err);
        var parsed = esprima.parse(contents, {loc: true});
        var ast = astjs.tools.simplify(parsed);

        cb(null,
           astjs.transform(ast,
                           function(ast) {
                               if (!astjs.is.statement(ast))
                                   return ast;
                               var coveredLines = covered(ast);
                               return [
                                   astjs.map.substitute(function stmt() {
                                       coverageTick($1);
                                   },{
                                       1: astjs.reify.literal({
                                           file: src,
                                           lines: coveredLines
                                       })
                                   }),
                                   ast
                               ];
                           })
          );
    });
}
