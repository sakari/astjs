var expression = {
	Identifier: 1,
	Literal: 1,
	BinaryExpression: 1,
	CallExpression: 1,
	AssignmentExpression: 1,
	ConditionalExpression: 1
};

exports.expression = function (ast) {
    return ast && expression[ast.type];
};

exports.identifier = function (ast) {
    return ast && ast.type === 'Identifier';
};

exports.vardecl = function (ast) {
    return ast && ast.type === 'VariableDeclaration';
};

var statement = {
    WhileStatement: 1,
    ForStatement: 1,
    VariableDeclaration: 1,
    EmptyStatement: 1,
    IfStatement: 1,
    ExpressionStatement: 1,
    FunctionDeclaration: 1
};

exports.statement = function(ast) {
    return ast && statement[ast.type];
};