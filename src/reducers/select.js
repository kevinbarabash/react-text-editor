export default (state, action) => {
    const { selection } = state;

    if (selection && selection.id === action.id && selection.pos === action.pos) {
        return {
            ...state,
            selection: null,
        };
    } else {
        return {
            ...state,
            selection: {
                id: action.id,
                pos: action.pos,
            },
        };
    }
};
