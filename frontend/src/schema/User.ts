import BaseModel, { type BaseProps } from './BaseModel'

interface UserProps extends BaseProps {
    email: string
    name: string
    avatar: string
    emailVisibility: boolean
    verified: boolean
}

class User extends BaseModel<UserProps> {
    static collection = 'users'
    static searchableFields = ['email', 'name']

    email!: string
    name!: string
    avatar!: string
    emailVisibility!: boolean
    verified!: boolean
}
export default User
