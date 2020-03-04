<!-- <script>
    import {onMount} from 'svelte';
    import {query} from 'svelte-apollo';
    import {userDateOfBirth} from '../../queries/queries';
    import Chart from '../charts/Chart.svelte';
    
    export let client;
    export let piscine;

    const userDateOfBirthLink = query(client, {query: userDateOfBirth(piscine.id)});

    onMount(() => {
        $userDateOfBirthLink
    });
</script>


 -->
