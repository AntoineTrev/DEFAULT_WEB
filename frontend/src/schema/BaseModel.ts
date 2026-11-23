export interface BaseProps {
    id: string
    created: string
    updated: string
}

abstract class BaseModel<T extends Record<string, any>> {
    id!: string
    created!: string
    updated!: string

    constructor(data: Partial<T>) {
        Object.assign(this, data)
    }

    static collection: string
    static searchableFields: string[] = []

    static hydrate<U extends typeof BaseModel>(this: U, record: Record<string, any>): InstanceType<U> {
        const instance = Object.create(this.prototype) as InstanceType<U>
        Object.assign(instance, record)
        return instance
    }

    toJSON() {
        return Object.assign({}, this)
    }
}

export default BaseModel
