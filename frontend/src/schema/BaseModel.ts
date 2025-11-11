import { pb } from '@/services/pocketbase'
import { useQuery, useMutation, useQueryCache } from '@pinia/colada'
import { ApiErrorHandler } from '@/utils/ApiErrorHandler'
import buildQueryOptions, { type QueryParams } from '@/utils/QueryParams.ts'
import { computed } from 'vue'

export interface BaseProps {
    id: string
    created: Date
    updated: Date
}

interface QueryResult<T> {
    items: T[]
    page: number
    perPage: number
    totalItems: number
    totalPages: number
}

abstract class BaseModel<T extends Record<string, any>> {
    id!: string
    created!: Date
    updated!: Date

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

    static useRead<U extends typeof BaseModel>(this: U, params: QueryParams = {}) {
        const key = [this.collection, JSON.stringify(params)]

        const query = useQuery<QueryResult<InstanceType<U>>>({
            key,
            query: async context => {
                const { signal } = context
                const { page, perPage, sort, filter } = buildQueryOptions({
                    ...params,
                    searchableFields: this.searchableFields,
                })
                return ApiErrorHandler.withRetry(
                    async () => {
                        const response = await pb().collection(this.collection).getList(page, perPage, {
                            sort,
                            filter,
                            signal,
                        })
                        return {
                            items: response.items.map(r => this.hydrate(r)),
                            page: response.page,
                            perPage: response.perPage,
                            totalItems: response.totalItems,
                            totalPages: response.totalPages,
                        }
                    },
                    { maxRetries: 3, baseDelay: 400 },
                    `Fetch ${this.collection}`,
                )
            },
            placeholderData: previousData => previousData,
        })

        return {
            ...query,
            data: computed(() => query.data.value?.items),
            page: computed(() => query.data.value?.page),
            perPage: computed(() => query.data.value?.perPage),
            totalItems: computed(() => query.data.value?.totalItems),
            totalPages: computed(() => query.data.value?.totalPages),
        }
    }

    static useCreate<U extends typeof BaseModel>(this: U) {
        const key = [this.collection]
        const queryCache = useQueryCache()
        return useMutation({
            mutation: async (payload: Partial<InstanceType<U>>) =>
                ApiErrorHandler.withRetry(
                    async (): Promise<InstanceType<U>> =>
                        this.hydrate(await pb().collection(this.collection).create(payload)),
                    { maxRetries: 2, baseDelay: 300 },
                    `Create ${this.collection}`,
                ),
            onSuccess: () => queryCache.invalidateQueries({ key }),
            onError: err => ApiErrorHandler.showToast(err, `Create ${this.collection}`),
        })
    }

    static useUpdate<U extends typeof BaseModel>(this: U) {
        const key = [this.collection]
        const queryCache = useQueryCache()
        return useMutation({
            mutation: async (model: InstanceType<U>) =>
                ApiErrorHandler.withRetry(
                    async (): Promise<InstanceType<U>> => {
                        const record = await pb().collection(this.collection).update(model.id, model)
                        return this.hydrate(record)
                    },
                    { maxRetries: 2 },
                    `Update ${this.collection}`,
                ),
            onSuccess: () => queryCache.invalidateQueries({ key }),
            onError: err => ApiErrorHandler.showToast(err, `Update ${this.collection}`),
        })
    }

    static useDelete<U extends typeof BaseModel>(this: U) {
        const key = [this.collection]
        const queryCache = useQueryCache()
        return useMutation({
            mutation: async (id: string) =>
                ApiErrorHandler.withRetry(
                    async (): Promise<string> => {
                        await pb().collection(this.collection).delete(id)
                        return id
                    },
                    { maxRetries: 2 },
                    `Delete ${this.collection}`,
                ),
            onSuccess: () => queryCache.invalidateQueries({ key }),
            onError: err => ApiErrorHandler.showToast(err, `Delete ${this.collection}`),
        })
    }

    static useSubscribe<U extends typeof BaseModel>(this: U, params: QueryParams = {}) {
        const key = [this.collection, JSON.stringify(params)]
        const queryCache = useQueryCache()
        return pb()
            .collection(this.collection)
            .subscribe('*', e => {
                const model = this.hydrate(e.record)

                queryCache.setQueryData<InstanceType<U>[]>(key, oldData => {
                    const data = oldData ?? []

                    switch (e.action) {
                        case 'create':
                            return [model, ...data]
                        case 'update':
                            return data.map((i: InstanceType<U>) => (i.id === model.id ? model : i))
                        case 'delete':
                            return data.filter((i: InstanceType<U>) => i.id !== e.record.id)
                        default:
                            return data
                    }
                })
                queryCache.invalidateQueries({ key })
            })
    }

    toJSON() {
        return { ...this }
    }
}

export default BaseModel
