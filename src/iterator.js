exports.visit = function(ast, fns) {
    if (fns.pre && !fns.pre(ast))
        return;
    if (ast instanceof Object)
        for(var k in ast) {
            exports.visit(ast[k], fns);
        }

    if(fns.post)
        fns.post(ast);
}