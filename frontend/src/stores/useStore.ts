import { computed } from 'vue'
import { pb } from '@/services/pocketbase'
import { useQuery } from '@pinia/colada'
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
    function read(params: QueryParams = {}) {
        const options = computed(() => buildQueryOptions({ ...params, searchableFields: Model.searchableFields }))
        const key = () => [Model.collection, JSON.stringify(options.value)]

        const query = useQuery<QueryResult<InstanceType<U>>>({
            key,
            query: async ({ signal }) => {
                const { page, perPage, sort, filter, filterParams } = options.value
                return ApiErrorHandler.withRetry(
                    async () => {
                        const response = await pb.collection(Model.collection).getList(page, perPage, {
                            sort,
                            filter: pb.filter(filter, filterParams),
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

    return { read }
}

export default useStore
