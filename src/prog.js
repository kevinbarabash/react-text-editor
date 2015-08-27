var prog = {
    type: "Program",
    body: [
        {
            type: "LineComment",
            content: "Single line comment"  // newlines are disallowed
        },
        {
            type: "BlockComment",
            content: "Block Comment\nLine 1\nLine 2"
        },
        {
            type: "BlankStatement"
        },
        {
            type: "ForOfStatement",
            left: {
                type: "VariableDeclaration",
                declarations: [{
                    type: "VariableDeclarator",
                    id: {
                        type: "Identifier",
                        name: "a"
                    },
                    init: null
                }],
                kind: "let"
            },
            right: {
                type: "ArrayExpression",
                elements: [
                    { type: "Literal", raw: "1.0" },
                    { type: "StringLiteral", value: "hello" },
                    {
                        type: "BinaryExpression",
                        left: { type: "Literal", raw: "-5" },
                        right: { type: "Literal", raw: "-7" },
                        operator: { type: "Operator", operator: "-" }
                    }
                ]
            },
            body: {
                type: "BlockStatement",
                body: [
                    {
                        type: "ExpressionStatement",
                        expression: {
                            type: "AssignmentExpression",
                            left: {
                                type: "Identifier",
                                name: "a"
                            },
                            operator: { type: "Operator", operator: "=" },
                            right: {
                                type: "BinaryExpression",
                                operator: { type: "Operator", operator: "+" },
                                left: {
                                    type: "Identifier",
                                    name: "a"
                                },
                                right: {
                                    type: "Placeholder"
                                }
                            }
                        }
                    },
                    { type: "BlankStatement" },
                    {
                        type: "ExpressionStatement",
                        expression: {
                            type: "CallExpression",
                            callee: {
                                type: "Identifier",
                                name: "ellipse"
                            },
                            arguments: [
                                {
                                    type: "BinaryExpression",
                                    operator: { type: "Operator", operator: "*" },
                                    left: {
                                        type: "Identifier",
                                        name: "a"
                                    },
                                    right: {
                                        type: "Literal",
                                        raw: "50"
                                    }
                                },
                                {
                                    type: "Literal",
                                    raw: "100"
                                },
                                {
                                    type: "Literal",
                                    raw: "100"
                                },
                                {
                                    type: "Literal",
                                    raw: "100"
                                }
                            ]
                        }
                    }
                ]
            }
        },
        { type: "BlankStatement" },
        {
            type: "ClassDeclaration",
            id: {
                type: "Identifier",
                name: "Foo"
            },
            body: {
                type: "ClassBody",
                body: [
                    {
                        type: "MethodDefinition",
                        key: {
                            type: "Identifier",
                            name: "constructor"
                        },
                        value: {
                            "type": "FunctionExpression",
                            "id": null,
                            "params": [],
                            "defaults": [],
                            "body": {
                                "type": "BlockStatement",
                                "body": [
                                    { type: "BlankStatement" }
                                ]
                            },
                            "generator": false,
                            "expression": false
                        },
                        kind: "constructor",
                        computed: false,
                        "static": false
                    }, {
                        type: "MethodDefinition",
                        key: {
                            type: "Identifier",
                            name: "bar"
                        },
                        value: {
                            "type": "FunctionExpression",
                            "id": null,
                            "params": [{
                                type: "Identifier",
                                name: "x"
                            }, {
                                type: "Identifier",
                                name: "y"
                            }],
                            "defaults": [],
                            "body": {
                                "type": "BlockStatement",
                                "body": [
                                    {
                                        type: "ReturnStatement",
                                        argument: {
                                            type: "BinaryExpression",
                                            operator: { type: "Operator", operator: "+" },
                                            left: {
                                                type: "Identifier",
                                                name: "x"
                                            },
                                            right: {
                                                type: "Identifier",
                                                name: "y"
                                            }
                                        }
                                    }
                                ]
                            },
                            "generator": false,
                            "expression": false
                        },
                        kind: "method",
                        computed: false,
                        "static": false
                    }
                ]
            }
        },
        { type: "BlankStatement" }
    ]
};

module.exports = prog;
