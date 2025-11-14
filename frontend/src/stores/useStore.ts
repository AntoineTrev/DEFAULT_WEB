import { computed, toRaw, type Ref } from 'vue'
import { pb } from '@/services/pocketbase'
import { useQuery, useMutation, useQueryCache } from '@pinia/colada'
import { ApiErrorHandler } from '@/utils/ApiErrorHandler'
import buildQueryOptions, { type QueryParams } from '@/utils/QueryParams.ts'
import type BaseModel from '@/schema/BaseModel'

interface QueryResult<T> {
    items: T[]
    page: number
    perPage: number
    totalItems: number
    totalPages: number
}

function useStore<U extends typeof BaseModel>(Model: U) {
    const queryCache = useQueryCache()

    function read(params: QueryParams = {}) {
        const key = [Model.collection, JSON.stringify(toRaw(params))]

        const query = useQuery<QueryResult<InstanceType<U>>>({
            key,
            query: async context => {
                const { signal } = context
                const { page, perPage, sort, filters } = buildQueryOptions({
                    ...params,
                    searchableFields: Model.searchableFields,
                })
                console.log(page, perPage, sort, filters)
                return ApiErrorHandler.withRetry(
                    async () => {
                        const response = await pb().collection(Model.collection).getList(page, perPage, {
                            sort,
                            filters,
                            signal,
                        })
                        return {
                            items: response.items.map(r => Model.hydrate(r)),
                            page: response.page,
                            perPage: response.perPage,
                            totalItems: response.totalItems,
                            totalPages: response.totalPages,
                        }
                    },
                    { maxRetries: 3, baseDelay: 400 },
                    `Fetch ${Model.collection}`,
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

    function create() {
        const key = [Model.collection]
        return useMutation({
            mutation: async (payload: Partial<InstanceType<U>>) =>
                ApiErrorHandler.withRetry(
                    async (): Promise<InstanceType<U>> =>
                        Model.hydrate(await pb().collection(Model.collection).create(payload)),
                    { maxRetries: 2, baseDelay: 300 },
                    `Create ${Model.collection}`,
                ),
            onSuccess: () => queryCache.invalidateQueries({ key }),
            onError: err => ApiErrorHandler.showToast(err, `Create ${Model.collection}`),
        })
    }

    function update() {
        const key = [Model.collection]
        return useMutation({
            mutation: async (model: InstanceType<U>) =>
                ApiErrorHandler.withRetry(
                    async (): Promise<InstanceType<U>> => {
                        const record = await pb().collection(Model.collection).update(model.id, model)
                        return Model.hydrate(record)
                    },
                    { maxRetries: 2 },
                    `Update ${Model.collection}`,
                ),
            onSuccess: () => queryCache.invalidateQueries({ key }),
            onError: err => ApiErrorHandler.showToast(err, `Update ${Model.collection}`),
        })
    }

    function remove() {
        const key = [Model.collection]
        return useMutation({
            mutation: async (id: string) =>
                ApiErrorHandler.withRetry(
                    async (): Promise<string> => {
                        await pb().collection(Model.collection).delete(id)
                        return id
                    },
                    { maxRetries: 2 },
                    `Delete ${Model.collection}`,
                ),
            onSuccess: () => queryCache.invalidateQueries({ key }),
            onError: err => ApiErrorHandler.showToast(err, `Delete ${Model.collection}`),
        })
    }

    function subscribe(params: QueryParams = {}) {
        const key = [Model.collection, JSON.stringify(params)]
        return pb()
            .collection(Model.collection)
            .subscribe('*', e => {
                const model = Model.hydrate(e.record)
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

    return { read, create, update, remove, subscribe }
}
export default useStore
