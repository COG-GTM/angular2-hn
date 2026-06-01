import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Comment } from './Comment'
import type { Comment as CommentType } from '../../types'

const mockComment: CommentType = {
    id: 1,
    level: 0,
    user: 'testuser',
    time: 1234567890,
    time_ago: '2 hours ago',
    content: '<p>Test comment content</p>',
    deleted: false,
    comments: [],
}

function renderComment(comment: CommentType = mockComment) {
    return render(
        <MemoryRouter>
            <Comment comment={comment} />
        </MemoryRouter>
    )
}

describe('Comment', () => {
    it('renders comment user and time', () => {
        renderComment()
        expect(screen.getByText('testuser')).toBeInTheDocument()
        expect(screen.getByText('2 hours ago')).toBeInTheDocument()
    })

    it('renders comment content as HTML', () => {
        renderComment()
        expect(screen.getByText('Test comment content')).toBeInTheDocument()
    })

    it('shows deleted message for deleted comments', () => {
        renderComment({ ...mockComment, deleted: true })
        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument()
    })

    it('can collapse and expand', async () => {
        const user = userEvent.setup()
        renderComment()
        expect(screen.getByText('Test comment content')).toBeInTheDocument()

        await user.click(screen.getByText('[-]'))
        expect(screen.queryByText('Test comment content')).not.toBeInTheDocument()

        await user.click(screen.getByText('[+]'))
        expect(screen.getByText('Test comment content')).toBeInTheDocument()
    })

    it('renders nested comments', () => {
        const nested: CommentType = {
            ...mockComment,
            comments: [
                {
                    id: 2,
                    level: 1,
                    user: 'nesteduser',
                    time: 1234567891,
                    time_ago: '1 hour ago',
                    content: '<p>Nested reply</p>',
                    deleted: false,
                    comments: [],
                },
            ],
        }
        renderComment(nested)
        expect(screen.getByText('nesteduser')).toBeInTheDocument()
        expect(screen.getByText('Nested reply')).toBeInTheDocument()
    })
})
