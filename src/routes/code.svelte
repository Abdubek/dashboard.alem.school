<script context="module">
    export async function preload(page, session) {
        const query = page.query;
		return { query };
	}
</script>

<script>
    import {onMount} from 'svelte';
    import { stores, goto } from '@sapper/app';
    import config from '../tools/config';
	import { post } from 'utils.js';
    export let query;
	const { session } = stores();

    // If no 'code' key in query
    if ('code' in query) {
        onMount(() => {
            init().catch(err => {
                console.log("err", err);
                goto('/');
            });
        });
    }

    async function init() {
        const result = await fetch(`${config.AUTH_URL}/?code=${query.code}`)
        if (!result.ok) {
            throw new Error("Response error.");
        }
        const data = await result.json();
        
        const response = await post(`auth/login`, data);
        if (response.jwt_token) {
			$session.user = response;
            $session.auth = true;
            goto('/leaderboard');
		}
    }
</script>