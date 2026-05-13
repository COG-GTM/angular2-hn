package com.devin.chess

enum class PieceType {
    KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN
}

enum class PieceColor {
    WHITE, BLACK;

    fun opposite(): PieceColor = if (this == WHITE) BLACK else WHITE
}

data class ChessPiece(
    val type: PieceType,
    val color: PieceColor
)

data class Position(val row: Int, val col: Int) {
    fun isValid(): Boolean = row in 0..7 && col in 0..7
}

data class Move(val from: Position, val to: Position)

class ChessModel {

    private val board = Array<Array<ChessPiece?>>(8) { arrayOfNulls(8) }
    var currentTurn: PieceColor = PieceColor.WHITE
        private set
    var gameOver: Boolean = false
        private set
    var winner: PieceColor? = null
        private set
    var lastMove: Move? = null
        private set
    private var whiteKingMoved = false
    private var blackKingMoved = false
    private var whiteRookAMoved = false
    private var whiteRookHMoved = false
    private var blackRookAMoved = false
    private var blackRookHMoved = false

    init {
        setupBoard()
    }

    private fun setupBoard() {
        val backRow = arrayOf(
            PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.QUEEN,
            PieceType.KING, PieceType.BISHOP, PieceType.KNIGHT, PieceType.ROOK
        )
        for (col in 0..7) {
            board[0][col] = ChessPiece(backRow[col], PieceColor.BLACK)
            board[1][col] = ChessPiece(PieceType.PAWN, PieceColor.BLACK)
            board[6][col] = ChessPiece(PieceType.PAWN, PieceColor.WHITE)
            board[7][col] = ChessPiece(backRow[col], PieceColor.WHITE)
        }
    }

    fun getPiece(row: Int, col: Int): ChessPiece? {
        if (row !in 0..7 || col !in 0..7) return null
        return board[row][col]
    }

    fun makeMove(from: Position, to: Position): Boolean {
        if (gameOver) return false
        val piece = board[from.row][from.col] ?: return false
        if (piece.color != currentTurn) return false
        if (!isValidMove(from, to)) return false

        // Handle castling
        if (piece.type == PieceType.KING && kotlin.math.abs(to.col - from.col) == 2) {
            performCastling(from, to)
        } else {
            // Handle en passant capture
            if (piece.type == PieceType.PAWN && to.col != from.col && board[to.row][to.col] == null) {
                board[from.row][to.col] = null
            }

            board[to.row][to.col] = piece
            board[from.row][from.col] = null
        }

        // Pawn promotion — auto-promote to queen
        if (piece.type == PieceType.PAWN && (to.row == 0 || to.row == 7)) {
            board[to.row][to.col] = ChessPiece(PieceType.QUEEN, piece.color)
        }

        updateCastlingFlags(piece, from)

        lastMove = Move(from, to)
        currentTurn = currentTurn.opposite()

        checkGameState()
        return true
    }

    private fun performCastling(kingFrom: Position, kingTo: Position) {
        val piece = board[kingFrom.row][kingFrom.col]!!
        board[kingTo.row][kingTo.col] = piece
        board[kingFrom.row][kingFrom.col] = null

        if (kingTo.col == 6) {
            // Kingside
            board[kingFrom.row][5] = board[kingFrom.row][7]
            board[kingFrom.row][7] = null
        } else if (kingTo.col == 2) {
            // Queenside
            board[kingFrom.row][3] = board[kingFrom.row][0]
            board[kingFrom.row][0] = null
        }
    }

    private fun updateCastlingFlags(piece: ChessPiece, from: Position) {
        if (piece.type == PieceType.KING) {
            if (piece.color == PieceColor.WHITE) whiteKingMoved = true
            else blackKingMoved = true
        }
        if (piece.type == PieceType.ROOK) {
            when {
                piece.color == PieceColor.WHITE && from.col == 0 -> whiteRookAMoved = true
                piece.color == PieceColor.WHITE && from.col == 7 -> whiteRookHMoved = true
                piece.color == PieceColor.BLACK && from.col == 0 -> blackRookAMoved = true
                piece.color == PieceColor.BLACK && from.col == 7 -> blackRookHMoved = true
            }
        }
    }

    fun getValidMoves(pos: Position): List<Position> {
        val piece = board[pos.row][pos.col] ?: return emptyList()
        if (piece.color != currentTurn) return emptyList()
        return getAllPossibleMoves(pos).filter { to ->
            !wouldBeInCheck(pos, to, piece.color)
        }
    }

    private fun isValidMove(from: Position, to: Position): Boolean {
        return to in getValidMoves(from)
    }

    private fun getAllPossibleMoves(pos: Position): List<Position> {
        val piece = board[pos.row][pos.col] ?: return emptyList()
        return when (piece.type) {
            PieceType.PAWN -> getPawnMoves(pos, piece.color)
            PieceType.KNIGHT -> getKnightMoves(pos, piece.color)
            PieceType.BISHOP -> getBishopMoves(pos, piece.color)
            PieceType.ROOK -> getRookMoves(pos, piece.color)
            PieceType.QUEEN -> getBishopMoves(pos, piece.color) + getRookMoves(pos, piece.color)
            PieceType.KING -> getKingMoves(pos, piece.color)
        }
    }

    private fun getPawnMoves(pos: Position, color: PieceColor): List<Position> {
        val moves = mutableListOf<Position>()
        val direction = if (color == PieceColor.WHITE) -1 else 1
        val startRow = if (color == PieceColor.WHITE) 6 else 1

        // Forward one
        val oneForward = Position(pos.row + direction, pos.col)
        if (oneForward.isValid() && board[oneForward.row][oneForward.col] == null) {
            moves.add(oneForward)
            // Forward two from start
            if (pos.row == startRow) {
                val twoForward = Position(pos.row + 2 * direction, pos.col)
                if (board[twoForward.row][twoForward.col] == null) {
                    moves.add(twoForward)
                }
            }
        }

        // Diagonal captures
        for (dc in listOf(-1, 1)) {
            val capture = Position(pos.row + direction, pos.col + dc)
            if (capture.isValid()) {
                val target = board[capture.row][capture.col]
                if (target != null && target.color != color) {
                    moves.add(capture)
                }
                // En passant
                if (target == null && isEnPassant(pos, capture, color)) {
                    moves.add(capture)
                }
            }
        }
        return moves
    }

    private fun isEnPassant(from: Position, to: Position, color: PieceColor): Boolean {
        val last = lastMove ?: return false
        val lastPiece = board[last.to.row][last.to.col] ?: return false
        if (lastPiece.type != PieceType.PAWN) return false
        if (kotlin.math.abs(last.from.row - last.to.row) != 2) return false
        if (last.to.row != from.row) return false
        if (last.to.col != to.col) return false
        return true
    }

    private fun getKnightMoves(pos: Position, color: PieceColor): List<Position> {
        val offsets = listOf(
            -2 to -1, -2 to 1, -1 to -2, -1 to 2,
            1 to -2, 1 to 2, 2 to -1, 2 to 1
        )
        return offsets.map { (dr, dc) -> Position(pos.row + dr, pos.col + dc) }
            .filter { it.isValid() && (board[it.row][it.col] == null || board[it.row][it.col]!!.color != color) }
    }

    private fun getSlidingMoves(pos: Position, color: PieceColor, directions: List<Pair<Int, Int>>): List<Position> {
        val moves = mutableListOf<Position>()
        for ((dr, dc) in directions) {
            var r = pos.row + dr
            var c = pos.col + dc
            while (r in 0..7 && c in 0..7) {
                val target = board[r][c]
                if (target == null) {
                    moves.add(Position(r, c))
                } else {
                    if (target.color != color) moves.add(Position(r, c))
                    break
                }
                r += dr
                c += dc
            }
        }
        return moves
    }

    private fun getBishopMoves(pos: Position, color: PieceColor): List<Position> {
        return getSlidingMoves(pos, color, listOf(-1 to -1, -1 to 1, 1 to -1, 1 to 1))
    }

    private fun getRookMoves(pos: Position, color: PieceColor): List<Position> {
        return getSlidingMoves(pos, color, listOf(-1 to 0, 1 to 0, 0 to -1, 0 to 1))
    }

    private fun getKingMoves(pos: Position, color: PieceColor): List<Position> {
        val moves = mutableListOf<Position>()
        for (dr in -1..1) {
            for (dc in -1..1) {
                if (dr == 0 && dc == 0) continue
                val to = Position(pos.row + dr, pos.col + dc)
                if (to.isValid() && (board[to.row][to.col] == null || board[to.row][to.col]!!.color != color)) {
                    moves.add(to)
                }
            }
        }
        // Castling
        moves.addAll(getCastlingMoves(pos, color))
        return moves
    }

    private fun getCastlingMoves(kingPos: Position, color: PieceColor): List<Position> {
        val moves = mutableListOf<Position>()
        if (isInCheck(color)) return moves

        val row = kingPos.row
        val kingMoved = if (color == PieceColor.WHITE) whiteKingMoved else blackKingMoved

        if (kingMoved) return moves

        // Kingside
        val rookHMoved = if (color == PieceColor.WHITE) whiteRookHMoved else blackRookHMoved
        if (!rookHMoved && board[row][5] == null && board[row][6] == null) {
            val rook = board[row][7]
            if (rook != null && rook.type == PieceType.ROOK && rook.color == color) {
                if (!isSquareAttacked(Position(row, 5), color.opposite()) &&
                    !isSquareAttacked(Position(row, 6), color.opposite())) {
                    moves.add(Position(row, 6))
                }
            }
        }

        // Queenside
        val rookAMoved = if (color == PieceColor.WHITE) whiteRookAMoved else blackRookAMoved
        if (!rookAMoved && board[row][1] == null && board[row][2] == null && board[row][3] == null) {
            val rook = board[row][0]
            if (rook != null && rook.type == PieceType.ROOK && rook.color == color) {
                if (!isSquareAttacked(Position(row, 2), color.opposite()) &&
                    !isSquareAttacked(Position(row, 3), color.opposite())) {
                    moves.add(Position(row, 2))
                }
            }
        }

        return moves
    }

    private fun isSquareAttacked(pos: Position, byColor: PieceColor): Boolean {
        for (r in 0..7) {
            for (c in 0..7) {
                val piece = board[r][c] ?: continue
                if (piece.color != byColor) continue
                val attackerPos = Position(r, c)
                val rawMoves = when (piece.type) {
                    PieceType.PAWN -> {
                        val dir = if (byColor == PieceColor.WHITE) -1 else 1
                        listOf(Position(r + dir, c - 1), Position(r + dir, c + 1))
                            .filter { it.isValid() }
                    }
                    PieceType.KNIGHT -> getKnightMoves(attackerPos, byColor)
                    PieceType.BISHOP -> getBishopMoves(attackerPos, byColor)
                    PieceType.ROOK -> getRookMoves(attackerPos, byColor)
                    PieceType.QUEEN -> getBishopMoves(attackerPos, byColor) + getRookMoves(attackerPos, byColor)
                    PieceType.KING -> {
                        val kingMoves = mutableListOf<Position>()
                        for (dr in -1..1) {
                            for (dc in -1..1) {
                                if (dr == 0 && dc == 0) continue
                                val to = Position(r + dr, c + dc)
                                if (to.isValid()) kingMoves.add(to)
                            }
                        }
                        kingMoves
                    }
                }
                if (pos in rawMoves) return true
            }
        }
        return false
    }

    private fun isInCheck(color: PieceColor): Boolean {
        val kingPos = findKing(color) ?: return false
        return isSquareAttacked(kingPos, color.opposite())
    }

    private fun findKing(color: PieceColor): Position? {
        for (r in 0..7) {
            for (c in 0..7) {
                val piece = board[r][c]
                if (piece != null && piece.type == PieceType.KING && piece.color == color) {
                    return Position(r, c)
                }
            }
        }
        return null
    }

    private fun wouldBeInCheck(from: Position, to: Position, color: PieceColor): Boolean {
        val captured = board[to.row][to.col]
        val moving = board[from.row][from.col]

        // Handle en passant capture in simulation
        var enPassantCaptured: ChessPiece? = null
        var enPassantPos: Position? = null
        if (moving?.type == PieceType.PAWN && to.col != from.col && captured == null) {
            enPassantPos = Position(from.row, to.col)
            enPassantCaptured = board[from.row][to.col]
            board[from.row][to.col] = null
        }

        board[to.row][to.col] = moving
        board[from.row][from.col] = null

        val inCheck = isInCheck(color)

        board[from.row][from.col] = moving
        board[to.row][to.col] = captured
        if (enPassantPos != null) {
            board[enPassantPos.row][enPassantPos.col] = enPassantCaptured
        }

        return inCheck
    }

    private fun checkGameState() {
        val hasValidMove = (0..7).any { r ->
            (0..7).any { c ->
                val piece = board[r][c]
                piece != null && piece.color == currentTurn && getValidMoves(Position(r, c)).isNotEmpty()
            }
        }
        if (!hasValidMove) {
            gameOver = true
            winner = if (isInCheck(currentTurn)) currentTurn.opposite() else null
        }
    }

    fun isCurrentPlayerInCheck(): Boolean = isInCheck(currentTurn)

    fun reset() {
        for (r in 0..7) for (c in 0..7) board[r][c] = null
        currentTurn = PieceColor.WHITE
        gameOver = false
        winner = null
        lastMove = null
        whiteKingMoved = false
        blackKingMoved = false
        whiteRookAMoved = false
        whiteRookHMoved = false
        blackRookAMoved = false
        blackRookHMoved = false
        setupBoard()
    }
}
