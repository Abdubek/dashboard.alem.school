<script>
    import {onMount} from 'svelte';
    import Chart from '../charts/Chart.svelte';
    import {customFetch} from '../../tools/auth';
    import config from '../../tools/config';
    
    export let piscine;
    export let children;
    export let currentEventIndex;

    let currentEventData = {};

    $: if (currentEventIndex != null) {
        updateCurrentEvent();
    }

    // updateCurrentEvent gets called whenever currentEventIndex
    // changes
    function updateCurrentEvent() {
        const event = children[currentEventIndex];
        getEventData(event.child).then(data => {
            currentEventData = data;
        });
    }

    // getEventData returns data {labels, dataset} for each type
    // of day: quest, raid, exam
    async function getEventData(event) {
        let labels = [];
        let dataset = [];
        if (event.type == 'quest') {
            let children = [];
            // get children of quest (subjects)
            let resp = await customFetch(`${config.API_URL}/object/${event.id}/children`);
            resp = await resp.json();
            const objects = resp.data.object_child;

            // push to arrays id and name of subject        
            for (let i = 0; i < objects.length; i++) {
                children.push({
                    Id: objects[i].child.id,
                    Name: objects[i].child.name
                });
            }

            // pass data
            resp = await customFetch(`${config.API_URL}/event/${piscine.id}/quest`, {
                method: 'POST',
                body: JSON.stringify(children),
            });
            resp = await resp.json();
            const data = resp.data;
            for (var key in data) {
                labels.push(key);
                dataset.push(data[key].aggregate.count);
            }
            return {labels, dataset};
        } else if (event.type == 'exam') {
            if (event.eventId == null) {
                return {labels, dataset};
            }
            let resp = await customFetch(`${config.API_URL}/object/${event.id}/children`);
            resp = await resp.json();
            const objects = resp.data.object_child;
            
            // find max length group
            let maxGroup = 0;
            for (let i = 0; i < objects.length; i++) {
                if (objects[i].attrs.group > maxGroup) {
                    maxGroup = objects[i].attrs.group
                }
            }
            // create groups arrays each containing objectId's of group index
            let groups = new Array(maxGroup);
            for (let i = 0; i < objects.length; i++) {
                
                if (groups[objects[i].attrs.group-1] == null) {
                    groups[objects[i].attrs.group-1] = {};
                    groups[objects[i].attrs.group-1].GroupID = objects[i].attrs.group;
                    groups[objects[i].attrs.group-1].ChildIDs = new Array();
                }
                groups[objects[i].attrs.group-1].ChildIDs.push(objects[i].child.id);
            }

            // pass data
            resp = await customFetch(`${config.API_URL}/event/${event.eventId}/exam`, {
                method: 'POST',
                body: JSON.stringify(groups),
            });
            resp = await resp.json();
            const data = resp.data;
            for (var key in data) {
                labels.push(key);
                dataset.push(data[key].aggregate.count);
            }
            return {labels, dataset};
        } else if (event.type == 'raid') {
            if (event.eventId == null) {
                return {labels, dataset};
            }
            let resp = await customFetch(`${config.API_URL}/object/${event.id}/children`);
            resp = await resp.json();
            const objects = resp.data.object_child;

            // push to array id and name of subject
            let children = [];        
            for (let i = 0; i < objects.length; i++) {
                children.push({
                    id: objects[i].child.id,
                    name: objects[i].child.name
                });
            }

            // pass data
            resp = await customFetch(`${config.API_URL}/event/${event.eventId}/quest`, {
                method: 'POST',
                body: JSON.stringify(children),
            });
            resp = await resp.json();
            const data = resp.data;
            for (var key in data) {
                labels.push(key);
                dataset.push(data[key].aggregate.count);
            }
            return {labels, dataset};
        }
    }
</script>


<Chart bind:result={currentEventData} legend={'Количество выполненных'}/>

