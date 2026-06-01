import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchUser } from '../../api/hackernews'
import { Loader } from '../../components/Loader/Loader'
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage'
import type { User as UserType } from '../../types'
import styles from './User.module.scss'

export default function User() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [user, setUser] = useState<UserType | null>(null)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        if (!id) return
        setUser(null)
        setErrorMessage('')
        fetchUser(id)
            .then(setUser)
            .catch(() => setErrorMessage(`Could not load user ${id}.`))
    }, [id])

    return (
        <>
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage && <ErrorMessage message={errorMessage} />}

            {user && (
                <div className={styles.profile}>
                    <div className={`${styles.mobile} ${styles['item-header']}`}>
                        <p className={styles['title-block']}>
                            <span className={styles['back-button']} onClick={() => navigate(-1)}></span>
                            Profile: {user.id}
                        </p>
                    </div>
                    <div className={styles['main-details']}>
                        <span className={styles.name}>{user.id}</span>
                        <span className={styles.right}>{user.karma} ★</span>
                        <p className={styles.age}>Created {user.created}</p>
                    </div>
                    {user.about && (
                        <div
                            className={styles['other-details']}
                            dangerouslySetInnerHTML={{ __html: user.about }}
                        />
                    )}
                </div>
            )}
        </>
    )
}
