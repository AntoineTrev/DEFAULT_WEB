import type { Ref } from 'vue'

export interface QueryParams {
    page?: Ref<number>
    perPage?: Ref<number>
    sortField?: Ref<string>
    sortOrder?: Ref<number> // 1 asc, -1 desc
    filters?: Ref<string>
    searchableFields?: string[]
}

export interface QueryOptions {
    page: number
    perPage: number
    sort: string
    filter: string
    filterParams: Record<string, string>
}

const FIELD_NAME = /^[a-zA-Z_][a-zA-Z0-9_]*$/

function buildQueryOptions(params: QueryParams): QueryOptions {
    const page = params.page?.value ?? 1
    const perPage = params.perPage?.value ?? 10

    const field = params.sortField?.value
    const sort = field && FIELD_NAME.test(field) ? `${params.sortOrder?.value === -1 ? '-' : ''}${field}` : '-created'

    const search = params.filters?.value?.trim()
    const fields = (params.searchableFields ?? []).filter(name => FIELD_NAME.test(name))
    if (!search || fields.length === 0) {
        return { page, perPage, sort, filter: '', filterParams: {} }
    }

    return {
        page,
        perPage,
        sort,
        filter: fields.map(name => `${name} ~ {:search}`).join(' || '),
        filterParams: { search },
    }
}

export default buildQueryOptions
