<script lang="ts">
    import { onMount } from 'svelte';
    import type { MediaIntent } from '$lib/server/db';
    import IntentForm from '$lib/components/IntentForm.svelte';
    
    let intents: MediaIntent[] = [];
    let selectedIntent: MediaIntent | null = null;
    let showForm = false;
    let error = '';
    
    async function loadIntents() {
        try {
            const response = await fetch('/api/intents');
            intents = await response.json();
        } catch (e) {
            error = 'Failed to load intents';
        }
    }
    
    async function handleSubmit(data: Omit<MediaIntent, 'id' | 'createdAt' | 'updatedAt' | 'intentEmbedding'>) {
        try {
            if (selectedIntent) {
                console.log('updating data ', JSON.stringify(data));
                await fetch(`/api/intents/${selectedIntent.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                console.log('reading?? data ', JSON.stringify(data));

                await fetch('/api/intents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            }
            await loadIntents();
            showForm = false;
            selectedIntent = null;
        } catch (e) {
            error = 'Failed to save intent';
        }
    }
    
    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this intent?')) return;
        
        try {
            await fetch(`/api/intents/${id}`, { method: 'DELETE' });
            await loadIntents();
        } catch (e) {
            error = 'Failed to delete intent';
        }
    }
    
    function handleEdit(intent: MediaIntent) {
        selectedIntent = intent;
        showForm = true;
    }
    
    function handleCancel() {
        showForm = false;
        selectedIntent = null;
    }
    
    onMount(loadIntents);
</script>

<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Media Intents Management</h1>
    
    {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
        </div>
    {/if}
    
    <div class="mb-8">
        <button
            on:click={() => {
                selectedIntent = null;
                showForm = true;
            }}
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
            Add New Intent
        </button>
    </div>
    
    {#if showForm}
        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 class="text-xl font-semibold mb-4">
                {selectedIntent ? 'Edit Intent' : 'New Intent'}
            </h2>
            <IntentForm 
                intent={selectedIntent || {}} 
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />
        </div>
    {/if}
    
    <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intent</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Media Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                {#each intents as intent}
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{intent.intent}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{intent.title}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{intent.mediaType}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{intent.order}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                            <button
                                on:click={() => handleEdit(intent)}
                                class="text-indigo-600 hover:text-indigo-900"
                            >
                                Edit
                            </button>
                            <button
                                on:click={() => handleDelete(intent.id)}
                                class="text-red-600 hover:text-red-900"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
