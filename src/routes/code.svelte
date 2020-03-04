<script>
    import {onMount} from 'svelte';
    import { stores, goto } from '@sapper/app';
    import config from '../tools/config';
    const { page } = stores();
    const query = $page.query;
    // If no 'code' key in query
    if ('code' in query) {
        onMount(() => {
            fetch(`${config.AUTH_URL}/?code=${query.code}`).then(resp => {
                if (!resp.ok) {
                    throw new Error("Response error.");
                }
                return resp.json();
            }).then(data => {
                for (var key in data) {
                    localStorage.setItem(key, data[key]);
                }
                goto('/leaderboard');
            }).catch(err => {
                console.log("err", err);
                goto('/');
            });
        });
    }
</script>