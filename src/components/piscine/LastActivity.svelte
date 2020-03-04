<script>
    import {onMount} from 'svelte';
    import {customFetch} from '../../tools/auth';
    import config from '../../tools/config';

    export let piscine;

    let activity = [];

    const end = `${piscine.end.getFullYear()}-${piscine.end.getMonth()+1}-${piscine.end.getDate()}T00:00:00%2B06:00`;
    onMount(() => {
        customFetch(`${config.API_URL}/event/${piscine.id}/users/lastActions?end=${end}`).then(resp => {
            return resp.json();
        }).then(result => {
            activity = [];
            const data = result.data.result;
            for (let i = 0; i < data.length; i++) {
                activity.push({
                    id: data[i].id,
                    githubLogin: data[i].progress.user.githubLogin,
                    grade: data[i].grade,
                    exercise: data[i].progress.object.name,
                });
            }
        });
    });
</script>
<table>
    {#each activity as element (element.id)}
    <tr>
        <td>{element.githubLogin}</td>
        <td>{element.exercise}</td>
        <td>{element.grade}</td>
    </tr>
    {:else}
    <tr>
        <td>Loading...</td>
    </tr>
    {/each}
</table>

<style>
table {
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

table td {
  border: 1px solid gray;
  padding: 5px;
}
</style>