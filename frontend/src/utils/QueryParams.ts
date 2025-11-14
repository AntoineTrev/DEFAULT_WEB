import { type Ref } from 'vue'

export interface QueryParams {
    page?: Ref<number>
    perPage?: Ref<number>
    sortField?: Ref<string>
    sortOrder?: Ref<number> // 1 asc, -1 desc
    filters?: Ref<string>
    searchableFields?: string[] // pour filtre global
}

function buildQueryOptions(params: QueryParams) {
    const page = params.page?.value ?? 1
    const perPage = params.perPage?.value ?? 10

    const sort = params.sortField?.value
        ? `${params.sortOrder?.value === -1 ? '-' : ''}${params.sortField.value}`
        : '-created'

    let filters = ''
    if (params.filters && params.searchableFields?.length) {
        const q = params.searchableFields.map(f => `${f}~"${params.filters?.value?.replace(/"/g, '\\"')}"`).join(' || ')
        filters = q
    } else if (params.filters) {
        filters = params.filters.value
    }

    return { page, perPage, sort, filters }
}

export default buildQueryOptions
