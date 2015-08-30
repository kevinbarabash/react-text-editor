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
            for: {
                type: "Keyword",
                keyword: "for"
            },
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
                kind: {
                    type: "Keyword",
                    keyword: "let"
                }
            },
            of: {
                type: "Keyword",
                keyword: "of"
            },
            right: {
                type: "ArrayExpression",
                elements: [
                    { type: "NumberLiteral", value: "1.0" },
                    { type: "StringLiteral", value: "hello" },
                    {
                        type: "BinaryExpression",
                        left: { type: "NumberLiteral", value: "-5" },
                        right: { type: "NumberLiteral", value: "-7" },
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
                                        type: "NumberLiteral",
                                        value: "50"
                                    }
                                },
                                {
                                    type: "NumberLiteral",
                                    value: "100"
                                },
                                {
                                    type: "NumberLiteral",
                                    value: "100"
                                },
                                {
                                    type: "NumberLiteral",
                                    value: "100"
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
            "class": {
                type: "Keyword",
                keyword: "class"  
            },
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
                                        "return": {
                                            type: "Keyword",
                                            keyword: "return"
                                        },
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
