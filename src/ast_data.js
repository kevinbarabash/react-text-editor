
var orderings = {
    BinaryExpression: ["left", "operator", "right"],
    VariableDeclaration: ["kind", "declarations"],
    VariableDeclarator: ["id", "init"],
    ClassDeclaration: ["class", "id", "body"],   // TODO handle 'extends' syntax
    ClassBody: ["body"],  // if it's an array, we can pick first/last easily
    MethodDefinition: ["key", "value"], // TODO 'static', 'computed'
    FunctionExpression: ["params", "body"],
    ReturnStatement: ["return", "argument"],
    ExpressionStatement: ["expression"],
    BlockStatement: ["body"],
    AssignmentExpression: ["left", "operator", "right"],
    CallExpression: ["callee", "arguments"],
    ForOfStatement: ["for", "left", "of", "right", "body"],
    ArrayExpression: ["elements"],
    Program: ["body"]
};

var leaves = [
    "NumberLiteral", 
    "StringLiteral", 
    "Identifier", 
    "Operator", 
    "Placeholder",
    "BlankStatement",   // blank line
    "Keyword"   // TODO replace plain old strings w/ Keyword nodes
];

export { orderings, leaves };
