<script lang="ts">
    import type { MediaIntent } from '$lib/server/db';
    
    export let intent: Partial<MediaIntent> = {};
    export let onSubmit: (data: Omit<MediaIntent, 'id'>) => void;
    
    let formData = {
        intent: intent.intent || '',
        order: intent.order || 0,
        mediaUrl: intent.mediaUrl || ''
    };
    
    function handleSubmit() {
        onSubmit(formData);
    }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
        <label for="intent" class="block text-sm font-medium text-gray-700">Intent</label>
        <input
            type="text"
            id="intent"
            bind:value={formData.intent}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
        />
    </div>
    
    <div>
        <label for="order" class="block text-sm font-medium text-gray-700">Order</label>
        <input
            type="number"
            id="order"
            bind:value={formData.order}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
        />
    </div>
    
    <div>
        <label for="mediaUrl" class="block text-sm font-medium text-gray-700">Media URL</label>
        <input
            type="url"
            id="mediaUrl"
            bind:value={formData.mediaUrl}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
        />
    </div>
    
    <button
        type="submit"
        class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
        {intent.id ? 'Update' : 'Create'} Intent
    </button>
</form> 