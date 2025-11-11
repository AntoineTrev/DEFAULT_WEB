// src/pocket/pbQueryBuilder.ts
export interface QueryParams {
    page?: number
    perPage?: number
    sortField?: string
    sortOrder?: number // 1 asc, -1 desc
    filter?: string
    searchableFields?: string[] // pour filtre global
}

function buildQueryOptions(params: QueryParams) {
    const page = params.page ?? 1
    const perPage = params.perPage ?? 10

    const sort = params.sortField ? `${params.sortOrder === -1 ? '-' : ''}${params.sortField}` : '-created'

    let filter = ''
    if (params.filter && params.searchableFields?.length) {
        const q = params.searchableFields.map(f => `${f}~"${params.filter?.replace(/"/g, '\\"')}"`).join(' || ')
        filter = q
    } else if (params.filter) {
        filter = params.filter
    }

    return { page, perPage, sort, filter }
}

export default buildQueryOptions
