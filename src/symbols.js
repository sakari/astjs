var iterator = require('./index').iterator;
var _ = require('underscore');

function locMap() {
    this._map = {};
}

locMap.prototype.set = function(name, startLine, startColumn, declaration) {
    if(!this._map[name])
        this._map[name] = {};
    if(!this._map[name][startLine])
        this._map[name][startLine] = {};
    this._map[name][startLine][startColumn] = declaration;
};

locMap.prototype.getAll = function(name) {
    if(!this._map[name])
        return [];
    return _.flatten(_.map(this._map[name], function(columns, line) {
        return _.map(columns, function(declaration, column) {
            return { line: line, column: column, declaration: declaration };
        });
    }));
}

locMap.prototype.get = function(name, startLine, startColumn) {
    if (!this._map[name] ||
        !this._map[name][startLine])
        return;
    return this._map[name][startLine][startColumn];
}

function scopeDeclarations(ast, declarations) {
    declarations = declarations || {};
    iterator.visit(ast, {
        pre: function(ast) {
            if(!ast || !ast.type)
                return true;;
            if(ast.type === 'VariableDeclaration') {
                ast.declarations.map(function(d) {
                    if (!declarations[d.id.name])
                        declarations[d.id.name] = d.id.loc.start;
                });
                ast.declarations.map(function(d) {
                    if(d.init)
                        scopeDeclarations(declarations[d.init], declarations);
                });
                return false;
            }
            if(ast.type === 'FunctionDeclaration') {
                if (!declarations[ast.id.name])
                    declarations[ast.id.name] = ast.id.loc.start;
                return false;
            }
            if(ast.type === 'FunctionExpression') {
                return false;
            }
            return true;
        }
    });
    return declarations;
}

function usages(ast, usageLocMap, scope) {
    iterator.visit(ast, {
        pre: function(ast) {
            if(!ast || !ast.type)
                return true;
            if(ast.type === 'FunctionDeclaration' ||
               ast.type === 'FunctionExpression') {
                var functionDeclarations = _.clone(scope);
                ast.params.map(function(p) {
                    functionDeclarations[p.name] = p.loc.start;
                    usageLocMap.set(p.name,
                                    p.loc.start.line,
                                    p.loc.start.column,
                                    p.loc.start)
                });
                functionDeclarations[ast.id.name] = ast.id.loc.start;
                usageLocMap.set(ast.id.name,
                                ast.id.loc.start.line,
                                ast.id.loc.start.column,
                                ast.id.loc.start)

                usages(ast.body, usageLocMap, functionDeclarations);
                return false;
            }
            if(ast.type === 'Identifier') {
                usageLocMap.set(ast.name,
                                ast.loc.start.line,
                                ast.loc.start.column,
                                scope[ast.name] || null);
            }
            return true;
        }
    });
    return usageLocMap;
}

module.exports = function(ast) {
    return usages(ast, new locMap(), scopeDeclarations(ast));
}