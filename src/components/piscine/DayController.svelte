<script>
    export let currentEventIndex = null;
    export let children;

    let currentEventName = 'Loading...';
    
    // changeCurrentEvent shifts currentEventIndex to += dir
    // dir: -1, 1
    function changeCurrentEvent(dir) {
        if (currentEventIndex+dir < 0 ||
            currentEventIndex+dir >= children.length) {
            return
        }
        currentEventIndex += dir;
    }

    $: if (currentEventIndex != null) {
        currentEventName = children[currentEventIndex].child.name;
    }
</script>

<p class="inline">{currentEventName}</p>
<span on:click="{() => {changeCurrentEvent(-1)}}" class="control">&laquo; Previous</span>
<span on:click="{() => {changeCurrentEvent(1)}}" class="control">Next &raquo;</span>

<style>
span.control {
  text-decoration: none;
  display: inline-block;
  padding: 8px 16px;
}

span.control:hover {
  background-color: #ddd;
}

.control {
  background-color: #f1f1f1;
}

.inline {
    display: inline-block;
}

</style>