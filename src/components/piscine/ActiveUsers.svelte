<script>
    import {onMount} from 'svelte';
    import {customFetch} from '../../tools/auth';
    import config from '../../tools/config';

    export let piscineEventId;
    export let currentEventIndex;
    export let children;

    let activeUsers = 'Loading...';

    async function updateActiveUsers() {
        const event = children[currentEventIndex];
        let eventId = piscineEventId;
        if (event.child.type == 'exam') {
            eventId = event.child.eventId;
        }
        const start = `${event.start.getFullYear()}-${event.start.getMonth()+1}-${event.start.getDate()}T00:01:00%2B06:00`;
        const end = `${event.end.getFullYear()}-${event.end.getMonth()+1}-${event.end.getDate()}T00:00:00%2B06:00`;
        let resp = await customFetch(`${config.API_URL}/event/${eventId}/users/active?start=${start}&end=${end}`)
        resp = await resp.json();
        let active = resp.data.user_aggregate.aggregate.count;
        return active;
    }

    $: if (currentEventIndex != null) {
        updateActiveUsers().then(active => {
            activeUsers = active;
        }).catch(err => {
            console.log("Error activeUsers:", err);
        });
    }
</script>

<h3>Активных пользователей</h3>
<h4>{activeUsers}</h4>

<style>
h3, h4 {
    padding: 0.5rem 0 0 0.5rem;
}
h4 {
    text-align: center;
}
</style>