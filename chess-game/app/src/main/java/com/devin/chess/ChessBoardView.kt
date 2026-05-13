package com.devin.chess

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View

class ChessBoardView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val lightSquare = Paint().apply { color = Color.parseColor("#F0D9B5") }
    private val darkSquare = Paint().apply { color = Color.parseColor("#B58863") }
    private val selectedPaint = Paint().apply { color = Color.parseColor("#7BF06292") }
    private val validMovePaint = Paint().apply {
        color = Color.parseColor("#6044CC44")
        style = Paint.Style.FILL
    }
    private val lastMovePaint = Paint().apply { color = Color.parseColor("#40FFFF00") }
    private val checkPaint = Paint().apply { color = Color.parseColor("#80FF0000") }
    private val piecePaint = Paint().apply {
        textAlign = Paint.Align.CENTER
        typeface = Typeface.DEFAULT_BOLD
        isAntiAlias = true
    }
    private val coordinatePaint = Paint().apply {
        color = Color.parseColor("#80000000")
        textAlign = Paint.Align.CENTER
        isAntiAlias = true
    }

    private var squareSize = 0f
    private var boardOffset = 0f
    var model: ChessModel? = null
    private var selectedPos: Position? = null
    private var validMoves: List<Position> = emptyList()

    var onMoveListener: (() -> Unit)? = null

    private val pieceSymbols = mapOf(
        PieceType.KING to ("♔" to "♚"),
        PieceType.QUEEN to ("♕" to "♛"),
        PieceType.ROOK to ("♖" to "♜"),
        PieceType.BISHOP to ("♗" to "♝"),
        PieceType.KNIGHT to ("♘" to "♞"),
        PieceType.PAWN to ("♙" to "♟")
    )

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val size = minOf(
            MeasureSpec.getSize(widthMeasureSpec),
            MeasureSpec.getSize(heightMeasureSpec)
        )
        setMeasuredDimension(size, size)
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        val boardSize = minOf(w, h)
        squareSize = boardSize / 8.4f
        boardOffset = squareSize * 0.2f
        piecePaint.textSize = squareSize * 0.78f
        coordinatePaint.textSize = squareSize * 0.18f
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val game = model ?: return

        drawBoard(canvas, game)
        drawPieces(canvas, game)
        drawCoordinates(canvas)
    }

    private fun drawBoard(canvas: Canvas, game: ChessModel) {
        val lastMove = game.lastMove
        val kingPos = if (game.isCurrentPlayerInCheck()) {
            findKingPosition(game, game.currentTurn)
        } else null

        for (row in 0..7) {
            for (col in 0..7) {
                val x = boardOffset + col * squareSize
                val y = boardOffset + row * squareSize
                val isLight = (row + col) % 2 == 0
                canvas.drawRect(x, y, x + squareSize, y + squareSize, if (isLight) lightSquare else darkSquare)

                // Highlight last move
                if (lastMove != null &&
                    ((row == lastMove.from.row && col == lastMove.from.col) ||
                            (row == lastMove.to.row && col == lastMove.to.col))) {
                    canvas.drawRect(x, y, x + squareSize, y + squareSize, lastMovePaint)
                }

                // Highlight check
                if (kingPos != null && row == kingPos.row && col == kingPos.col) {
                    canvas.drawRect(x, y, x + squareSize, y + squareSize, checkPaint)
                }

                // Highlight selected
                val sel = selectedPos
                if (sel != null && row == sel.row && col == sel.col) {
                    canvas.drawRect(x, y, x + squareSize, y + squareSize, selectedPaint)
                }

                // Valid move indicators
                val pos = Position(row, col)
                if (pos in validMoves) {
                    val piece = game.getPiece(row, col)
                    if (piece != null) {
                        // Capture indicator — ring around the square
                        val ringPaint = Paint().apply {
                            color = Color.parseColor("#6044CC44")
                            style = Paint.Style.STROKE
                            strokeWidth = squareSize * 0.08f
                        }
                        canvas.drawRect(
                            x + squareSize * 0.04f, y + squareSize * 0.04f,
                            x + squareSize * 0.96f, y + squareSize * 0.96f, ringPaint
                        )
                    } else {
                        // Move indicator — small circle
                        canvas.drawCircle(
                            x + squareSize / 2, y + squareSize / 2,
                            squareSize * 0.15f, validMovePaint
                        )
                    }
                }
            }
        }
    }

    private fun drawPieces(canvas: Canvas, game: ChessModel) {
        for (row in 0..7) {
            for (col in 0..7) {
                val piece = game.getPiece(row, col) ?: continue
                val x = boardOffset + col * squareSize + squareSize / 2
                val y = boardOffset + row * squareSize + squareSize * 0.72f
                val symbol = pieceSymbols[piece.type] ?: continue
                val text = if (piece.color == PieceColor.WHITE) symbol.first else symbol.second

                // Draw outline for visibility
                piecePaint.color = if (piece.color == PieceColor.WHITE) Color.BLACK else Color.parseColor("#333333")
                piecePaint.style = Paint.Style.STROKE
                piecePaint.strokeWidth = squareSize * 0.03f
                canvas.drawText(text, x, y, piecePaint)

                // Draw fill
                piecePaint.color = if (piece.color == PieceColor.WHITE) Color.WHITE else Color.BLACK
                piecePaint.style = Paint.Style.FILL
                canvas.drawText(text, x, y, piecePaint)
            }
        }
    }

    private fun drawCoordinates(canvas: Canvas) {
        val files = "abcdefgh"
        val ranks = "87654321"
        for (i in 0..7) {
            // File labels (bottom)
            canvas.drawText(
                files[i].toString(),
                boardOffset + i * squareSize + squareSize / 2,
                boardOffset + 8 * squareSize + squareSize * 0.18f,
                coordinatePaint
            )
            // Rank labels (left)
            coordinatePaint.textAlign = Paint.Align.RIGHT
            canvas.drawText(
                ranks[i].toString(),
                boardOffset - squareSize * 0.05f,
                boardOffset + i * squareSize + squareSize * 0.6f,
                coordinatePaint
            )
            coordinatePaint.textAlign = Paint.Align.CENTER
        }
    }

    private fun findKingPosition(game: ChessModel, color: PieceColor): Position? {
        for (r in 0..7) {
            for (c in 0..7) {
                val piece = game.getPiece(r, c)
                if (piece != null && piece.type == PieceType.KING && piece.color == color) {
                    return Position(r, c)
                }
            }
        }
        return null
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (event.action != MotionEvent.ACTION_DOWN) return true
        val game = model ?: return true
        if (game.gameOver) return true

        val col = kotlin.math.floor((event.x - boardOffset) / squareSize).toInt()
        val row = kotlin.math.floor((event.y - boardOffset) / squareSize).toInt()
        if (row !in 0..7 || col !in 0..7) return true

        val tappedPos = Position(row, col)
        val sel = selectedPos

        if (sel != null && tappedPos in validMoves) {
            game.makeMove(sel, tappedPos)
            selectedPos = null
            validMoves = emptyList()
            invalidate()
            onMoveListener?.invoke()
            return true
        }

        val piece = game.getPiece(row, col)
        if (piece != null && piece.color == game.currentTurn) {
            selectedPos = tappedPos
            validMoves = game.getValidMoves(tappedPos)
        } else {
            selectedPos = null
            validMoves = emptyList()
        }

        invalidate()
        return true
    }

    fun clearSelection() {
        selectedPos = null
        validMoves = emptyList()
        invalidate()
    }
}
