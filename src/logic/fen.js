export function gameStateToFen(gameState) {
    const board = boardToFen(gameState.board);

    const side = gameState.turn === 'white' ? 'w' : 'b';

    const castling = castlingToFen(gameState.castlingRights);

    const enPassant = enPassantToFen(gameState.enPassantTarget);

    return `${board} ${side} ${castling} ${enPassant}`;
}

function pieceToFen(piece) {
    if (!piece) return null;

    const [color, type] = piece.split('_');

    const map = {
        pawn: 'p',
        knight: 'n',
        bishop: 'b',
        rook: 'r',
        queen: 'q',
        king: 'k'
    };

    let char = map[type];

    if (color === 'white') {
        char = char.toUpperCase();
    }

    return char;
}

function boardToFen(board) {
    let fen = '';

    for (let row = 0; row < 8; row++) {
        let empty = 0;

        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            const fenChar = pieceToFen(piece);

            if (!fenChar) {
                empty++;
            } else {
                if (empty > 0) {
                    fen += empty;
                    empty = 0;
                }
                fen += fenChar;
            }
        }

        if (empty > 0) fen += empty;

        if (row !== 7) fen += '/';
    }

    return fen;
}

function castlingToFen(castling) {
    let str = '';

    if (castling.white.kingside) str += 'K';
    if (castling.white.queenside) str += 'Q';
    if (castling.black.kingside) str += 'k';
    if (castling.black.queenside) str += 'q';

    return str || '-';
}

function enPassantToFen(target) {
    if (!target) return '-';

    const files = 'abcdefgh';

    const file = files[target.col];
    const rank = 8 - target.row;

    return file + rank;
}
