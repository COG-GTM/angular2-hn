import { NavLink } from 'react-router-dom'

function Header() {
  return (
    <header>
      <nav>
        <NavLink to="/news/1">Angular 2 HN</NavLink> | <NavLink to="/newest/1">new</NavLink> |{' '}
        <NavLink to="/show/1">show</NavLink> | <NavLink to="/ask/1">ask</NavLink> |{' '}
        <NavLink to="/jobs/1">jobs</NavLink>
      </nav>
    </header>
  )
}

export default Header
