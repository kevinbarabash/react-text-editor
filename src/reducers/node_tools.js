// TODO: cursorIsOnLeftEdge, cursorIsOnRightEdget
// TODO: getPreviousNode, getNextNode

export const getValue = function(node) {
    if (node.type === 'NumberLiteral') {
        return node.value;
    } else if (node.type === 'StringLiteral') {
        return `"${node.value}"`;
    } else if (node.type === 'Identifier') {
        return node.name;
    }
};

let id = 0;

export const generateId = () => id++;
