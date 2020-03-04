<script context="module">
    export async function preload(page, session) {
        const {piscineId} = page.params;
        return {piscineId};
    }
</script>

<script>
    import {onMount} from 'svelte';
    import {formatDate} from '../../../../tools/tools';
    import config from '../../../../tools/config';
    import {customFetch} from '../../../../tools/auth';
    import DayChart from '../../../../components/piscine/DayChart.svelte';
    import DayController from '../../../../components/piscine/DayController.svelte';
    import ActiveUsers from '../../../../components/piscine/ActiveUsers.svelte';
    import LastActivity from '../../../../components/piscine/LastActivity.svelte';
    // import AgeChart from '../../../../components/piscine/AgeChart.svelte';
    
    export let piscineId;

    let piscine;
    let children;
    let currentEventIndex;
    let dates = 'Loading...';
    let activeUsers = 'Loading...';

    onMount(() => {
        init();
    });

    async function init() {
        // fetch info about current piscine
        let resp = await customFetch(`${config.API_URL}/event/${piscineId}`)
        resp = await resp.json();

        piscine = resp.data.event[0];
        piscine.created = new Date(piscine.createdAt);
        piscine.end = new Date(piscine.endAt);
        dates = `${formatDate(piscine.created)} - ${formatDate(piscine.end)}`;

        // fetch info about piscine children, e.g.: quests, raids, exams
        resp = await customFetch(`${config.API_URL}/object/26/children`)
        resp = await resp.json();

        children = resp.data.object_child;
        let duration = 1;
        let start = piscine.created;
        // set event start and end times to each event
        for (let i = 0; i < children.length; i++) {
            children[i].start = new Date(start);
            // shift time
            if ('duration' in children[i].attrs) {
                duration = children[i].attrs.duration;
            } else {
                duration = 1
            }
            start.setDate(start.getDate() + duration);
            
            children[i].end = new Date(start);
        }

        // assign to each child its eventId.
        // applicable for raids and exams.
        for (let i = 0; i < piscine.children.length; i++) {
            for (let j = 0; j < children.length; j++) {
                if (piscine.children[i].object.id == children[j].child.id) {
                    children[j].child.eventId = piscine.children[i].id;
                    break;
                }
            }
        }
        // get current event index
        currentEventIndex = closestDay(children);
    }

    // closestDay function returns index of a day that is closest
    // to current time.
    function closestDay(children) {
        const now = new Date();
        let minIndex = 0;
        for (let i = 0; i < children.length; i++) {
            const diff = now - children[i].start;
            if (diff > 0 && diff < now-children[minIndex].start) {
                minIndex = i;
            }
        }
        return minIndex;
    }

</script>

<h1>Бассейн id:{piscineId}</h1>
<h2>{dates}</h2>
<p><a target="_blank" href="/admin/piscine/{piscineId}/students">Список участвующих</a></p>

{#if piscine && children}
<DayController {children} bind:currentEventIndex={currentEventIndex} />
<DayChart {piscine} {children} {currentEventIndex} />
{/if}

<div class="box">
  <div class="block border">
    {#if children}
    <ActiveUsers piscineEventId={piscine.id} bind:currentEventIndex={currentEventIndex} {children}/>
    {/if}
  </div>

  <div class="block">
    <h3>Активность</h3>
    {#if piscine && children}
    <LastActivity {piscine}/>
    {/if}
  </div>
</div>


<style>
.box {
    display: flex;
    justify-content: space-between;
}
.box .block {
    margin: 0.5rem;
    width: 25rem;
}

.border {
    border: 1px solid gray;
}
</style>
