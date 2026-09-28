import { Navigate, Route, Routes } from 'react-router-dom'
import type { FeedType } from './api'
import { Feed } from './feeds/Feed/Feed'
import { ItemDetails } from './item-details/ItemDetails/ItemDetails'
import { User } from './user/User/User'

// Port of src/app/app.routes.ts plus the child routes of item-details.module.ts and user.module.ts.
const FEED_TYPES: FeedType[] = ['news', 'newest', 'show', 'ask', 'jobs']

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/news/1" replace />} />
      {FEED_TYPES.map((feedType) => (
        <Route key={feedType} path={feedType}>
          <Route index element={<Navigate to={`/${feedType}/1`} replace />} />
          <Route path=":page" element={<Feed key={feedType} feedType={feedType} />} />
        </Route>
      ))}
      <Route path="/item/:id" element={<ItemDetails />} />
      <Route path="/user/:id" element={<User />} />
    </Routes>
  )
}
