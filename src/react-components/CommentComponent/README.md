# CommentComponent (React)

A React component that displays Hacker News comments with collapse/expand functionality and recursive rendering of nested comments.

## Migration from Angular

This component is a React migration of the Angular CommentComponent from `src/app/item-details/comment/`. It maintains the same functionality and visual appearance while using React patterns.

## Usage

```tsx
import CommentComponent from './react-components/CommentComponent';
import { Comment } from './react-components/types/Comment';

const comment: Comment = {
  id: 1,
  level: 0,
  user: 'username',
  time: 1234567890,
  time_ago: '2 hours ago',
  content: 'This is a comment',
  deleted: false,
  comments: []
};

<CommentComponent comment={comment} />
```

## Features

- **Collapse/Expand**: Click the `[-]` or `[+]` button to collapse or expand the comment
- **Recursive Rendering**: Automatically renders nested sub-comments
- **Deleted Comments**: Special handling for deleted comments with `[deleted]` indicator
- **Responsive Design**: Adapts to mobile and tablet screen sizes
- **HTML Content**: Safely renders HTML content in comments using `dangerouslySetInnerHTML`

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| comment | Comment | Yes | The comment object to render |

## Comment Interface

```typescript
interface Comment {
  id: number;
  level: number;
  user: string;
  time: number;
  time_ago: string;
  content: string;
  deleted: boolean;
  comments: Comment[];
}
```

## Styling

The component uses CSS modules (`CommentComponent.module.scss`) to avoid global style conflicts while maintaining the exact visual appearance of the original Angular component.

## Migration Notes

- **State Management**: Uses `useState` hook instead of Angular component properties
- **Event Handling**: Uses React onClick handlers instead of Angular event binding
- **Conditional Rendering**: Uses React conditional rendering instead of Angular `*ngIf` and `[hidden]`
- **HTML Content**: Uses `dangerouslySetInnerHTML` instead of Angular `[innerHTML]`
- **Routing**: User links use standard `href` attributes (will need React Router integration when used in a React app)
