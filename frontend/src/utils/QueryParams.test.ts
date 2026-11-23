import { describe, expect, it } from 'vite-plus/test'
import { ref } from 'vue'
import buildQueryOptions from './QueryParams'

describe('buildQueryOptions', () => {
    it('utilise les valeurs par défaut', () => {
        expect(buildQueryOptions({})).toEqual({ page: 1, perPage: 10, sort: '-created', filter: '', filterParams: {} })
    })

    it('construit le tri et transmet la recherche comme paramètre', () => {
        const params = {
            page: ref(2),
            perPage: ref(5),
            sortField: ref('name'),
            sortOrder: ref(1),
            filters: ref('Alice'),
            searchableFields: ['email', 'name'],
        }

        expect(buildQueryOptions(params)).toEqual({
            page: 2,
            perPage: 5,
            sort: 'name',
            filter: 'email ~ {:search} || name ~ {:search}',
            filterParams: { search: 'Alice' },
        })

        params.sortOrder.value = -1
        expect(buildQueryOptions(params).sort).toBe('-name')
    })

    it('rejette un tri injecté et garde la recherche comme valeur littérale', () => {
        const options = buildQueryOptions({
            sortField: ref('name" || id != ""'),
            filters: ref('x" || id != ""'),
            searchableFields: ['email', 'name'],
        })

        expect(options.sort).toBe('-created')
        expect(options.filter).toBe('email ~ {:search} || name ~ {:search}')
        expect(options.filterParams).toEqual({ search: 'x" || id != ""' })
    })
})
