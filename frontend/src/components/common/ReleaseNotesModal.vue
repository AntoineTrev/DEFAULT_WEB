<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { markdownToHtml } from '@/composables/releaseNotesMarkdown'
import { useReleaseNotes } from '@/composables/useReleaseNotes'

const { t } = useI18n()
const { entries } = useReleaseNotes()
const visible = ref(false)

const releaseEntries = computed(() => entries.value ?? [])

function open(): void {
    visible.value = true
}

defineExpose({ open })
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :header="t('releases.title')"
        class="release-notes-dialog"
        :style="{ maxWidth: '38rem', width: '100%' }">
        <p class="release-notes-dialog__description mb-4">{{ t('releases.description') }}</p>

        <div
            v-if="releaseEntries.length === 0"
            class="release-notes-dialog__empty"
            role="status">
            {{ t('releases.empty') }}
        </div>

        <ol
            v-else
            class="release-notes-dialog__list list-none p-0 m-0">
            <li
                v-for="entry in releaseEntries"
                :key="entry.version"
                class="release-notes-dialog__entry mb-5">
                <!-- Local markdown only: markdownToHtml escapes all text before building the HTML. -->
                <div
                    class="release-notes-dialog__body"
                    v-html="markdownToHtml(entry.content)" />
            </li>
        </ol>

        <template #footer>
            <Button
                type="button"
                :label="t('releases.close')"
                text
                @click="visible = false" />
        </template>
    </Dialog>
</template>

<style scoped lang="scss">
.release-notes-dialog__description {
    color: var(--p-text-muted-color);
    font-size: 0.875rem;
}

.release-notes-dialog__empty {
    padding: 1rem 0;
    color: var(--p-text-muted-color);
    font-style: italic;
    text-align: center;
}

.release-notes-dialog__list {
    margin: 0;
    padding: 0;
    list-style: none;
}

.release-notes-dialog__body {
    :deep(h1) {
        margin: 0 0 0.5rem;
        color: var(--p-text-color);
        font-size: 1.25rem;
        font-weight: 600;
    }

    :deep(h2) {
        margin: 0.75rem 0 0.25rem;
        color: var(--p-text-color);
        font-size: 1rem;
        font-weight: 600;
    }

    :deep(h3) {
        margin: 0.5rem 0 0.25rem;
        color: var(--p-text-muted-color);
        font-size: 0.875rem;
        font-weight: 600;
        letter-spacing: 0.03em;
        text-transform: uppercase;
    }

    :deep(p) {
        margin: 0.35rem 0;
        color: var(--p-text-color);
        line-height: 1.5;
    }

    :deep(ul) {
        margin: 0.25rem 0;
        padding-left: 1.25rem;
    }

    :deep(li) {
        margin: 0.25rem 0;
        color: var(--p-text-color);
        line-height: 1.5;
    }

    :deep(strong) {
        font-weight: 600;
    }

    :deep(code) {
        padding: 0.1em 0.35em;
        border-radius: 3px;
        background: var(--p-surface-100);
        font-size: 0.85em;
    }
}
</style>
