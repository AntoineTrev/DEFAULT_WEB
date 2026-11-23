import { describe, expect, it } from 'vite-plus/test'
import { ref } from 'vue'
import buildQueryOptions from './QueryParams'

describe('buildQueryOptions', () => {
    it('utilise les valeurs par défaut', () => {
        expect(buildQueryOptions({})).toEqual({ page: 1, perPage: 10, sort: '-created', filters: '' })
    })

    it('construit le tri et conserve un filtre simple', () => {
        const params = {
            page: ref(2),
            perPage: ref(5),
            sortField: ref('name'),
            sortOrder: ref(1),
            filters: ref('Alice'),
        }

        expect(buildQueryOptions(params)).toEqual({ page: 2, perPage: 5, sort: 'name', filters: 'Alice' })

        params.sortOrder.value = -1
        expect(buildQueryOptions(params).sort).toBe('-name')
    })

    it('échappe les guillemets et recherche dans tous les champs', () => {
        const filters = buildQueryOptions({ filters: ref('a"b'), searchableFields: ['email', 'name'] }).filters

        expect(filters).toBe('email~"a\\"b" || name~"a\\"b"')
    })
})
