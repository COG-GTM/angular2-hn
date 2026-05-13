package com.devin.chess

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var chessBoard: ChessBoardView
    private lateinit var statusText: TextView
    private lateinit var turnIndicator: TextView
    private lateinit var newGameButton: Button

    private val chessModel = ChessModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        chessBoard = findViewById(R.id.chessBoard)
        statusText = findViewById(R.id.statusText)
        turnIndicator = findViewById(R.id.turnIndicator)
        newGameButton = findViewById(R.id.newGameButton)

        chessBoard.model = chessModel
        chessBoard.onMoveListener = { updateStatus() }

        newGameButton.setOnClickListener {
            chessModel.reset()
            chessBoard.clearSelection()
            updateStatus()
        }

        updateStatus()
    }

    private fun updateStatus() {
        if (chessModel.gameOver) {
            val message = when (chessModel.winner) {
                PieceColor.WHITE -> "White wins by checkmate!"
                PieceColor.BLACK -> "Black wins by checkmate!"
                null -> "Stalemate — it's a draw!"
            }
            statusText.text = message
            turnIndicator.text = "Game Over"

            AlertDialog.Builder(this)
                .setTitle("Game Over")
                .setMessage(message)
                .setPositiveButton("New Game") { _, _ ->
                    chessModel.reset()
                    chessBoard.clearSelection()
                    updateStatus()
                }
                .setNegativeButton("OK", null)
                .show()
        } else {
            val turnStr = if (chessModel.currentTurn == PieceColor.WHITE) "White" else "Black"
            turnIndicator.text = "$turnStr's Turn"
            statusText.text = if (chessModel.isCurrentPlayerInCheck()) "Check!" else ""
        }
    }
}
