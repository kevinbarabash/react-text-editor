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
                        type: "MathExpression",
                        children: [
                            { type: "NumberLiteral", value: "-5" },
                            { type: "Operator", operator: "-" },
                            { type: "NumberLiteral", value: "-7" }
                        ]
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
                                type: "MathExpression",
                                children: [
                                    {
                                        type: "Identifier",
                                        name: "a"
                                    },
                                    { type: "Operator", operator: "+" },
                                    { type: "Placeholder" },
                                    { type: "Operator", operator: "*" },
                                    { type: "Placeholder" }
                                ]
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
                                    type: "MathExpression",
                                    children: [
                                        {
                                            type: "Identifier",
                                            name: "a"
                                        },
                                        { type: "Operator", operator: "*" },
                                        {
                                            type: "NumberLiteral",
                                            value: "50"
                                        }
                                    ]
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
            type: "ExpressionStatement",
            expression: {
                type: "AssignmentExpression",
                left: {
                    type: "Identifier",
                    name: "x"
                },
                operator: {
                    type: "Operator",
                    operator: "="
                },
                right: {
                    type: "MathExpression",
                    children: [
                        {
                            type: "Parentheses",
                            expression: {
                                type: "MathExpression",
                                children: [
                                    {
                                        type: "Identifier",
                                        name: "x"
                                    },
                                    {
                                        type: "Operator",
                                        operator: "+"
                                    },
                                    {
                                        type: "NumberLiteral",
                                        value: "1"
                                    },
                                    {
                                        type: "Operator",
                                        operator: "-"
                                    },
                                    {
                                        type: "Identifier",
                                        name: "y"
                                    }
                                ]
                            }
                        },
                        {
                            type: "Operator",
                            operator: "/"
                        },
                        {
                            type: "NumberLiteral",
                            value: "2.0"
                        }
                    ]
                }
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
                                            type: "MathExpression",
                                            children: [
                                                {
                                                    type: "Identifier",
                                                    name: "x"
                                                },
                                                {
                                                    type: "Operator",
                                                    operator: "+"
                                                },
                                                {
                                                    type: "Identifier",
                                                    name: "y"
                                                }

                                            ]
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
