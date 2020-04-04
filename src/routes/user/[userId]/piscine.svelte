<script context="module">
    export async function preload(page, session) {
        if (session.auth == null) {
            this.redirect(302, "/");
        }
        const {userId} = page.params;
        return {userId};
    }
</script>

<script>
    import { stores } from '@sapper/app';
    
	const { session } = stores();
    let jwt_token = $session.user.jwt_token;    

    import {onMount} from 'svelte';
    import {customFetch} from '../../../tools/auth';
    import {formatDate} from '../../../tools/tools';
    import config from '../../../tools/config';

    import { fade } from 'svelte/transition';
    import Loading from '../../../components/Loading.svelte';

    export let userId;
    
    let examNames = ["Exam 01", "Exam 02", "Exam 03", "Final Exam"]
    let raidNames = ["Raid 01", "Raid 02", "Raid 03",]
    let user = null;
    let exams = null;
    let raidNotes = null;
    let toad = null;
    let quests = null;
    let questsData = null;
    let exerciseNames = {};

    onMount(() => {
        // Start calendar

        customFetch(`${config.API_URL}/user/${userId}/piscine`, jwt_token).then(resp => {
            return resp.json();
        }).then(resp => {
            console.log(resp);
            user = resp.user.data.user[0];
            exams = resp.exams.data;
            raidNotes = resp.raidNotes.data.progress;
            if (resp.toad.data.progress.length > 0) {
                toad = resp.toad.data.progress[0].attrs;
            }
            questsData = resp.quests.data;

            quests = preprocessQuests(questsData);
        }).catch(err => {
            console.log(`Error: ${err}`);
        });

        customFetch(`${config.API_URL}/exercises`, jwt_token).then(resp => {
            return resp.json();
        }).then(resp => {
            exerciseNames = resp;
        });
    });

    function preprocessQuests(toadData) {
        let result = {};
        for (let key in toadData) {
            if (!(key in result)) {
                result[key] = {};
            }
            for (let j = 0; j < toadData[key].length; j++) {
                const objName = toadData[key][j].progress.object.name;
                if (!(objName in result[key])) {
                    result[key][objName] = {
                        'done': false,
                        'attempts': 0
                    }
                }
                if (toadData[key][j].grade == 1) {
                    result[key][objName].done = true;
                } else {
                    result[key][objName].attempts++;
                }
            }
        }
        return result;
    }

    $: githubLogin = user == null ? "Loading..." : user.githubLogin;
</script>

<svelte:head>
    <title>
        {githubLogin} | dashboard
    </title>
</svelte:head>

{#if user}
<h2>{user.firstName} <strong>"{user.githubLogin}"</strong> {user.lastName}</h2>

<div class="flex-grid">
    <div>
        {#if toad}
            <h2>Toad</h2>
            {#if 'attempts' in toad}
                <p>⏳ attempts = {toad.attempts.length+1}</p>
            {/if}
            <p>💾 memory = {toad.games[0].results.length}</p>
            <p>🕹 zzle = {toad.games[1].results.length}</p>
        {:else}
            <p>Something went wrong.</p>
        {/if}
    </div>
    <div>
        {#if raidNotes}
            <h2>Raid</h2>
            {#each raidNotes as raidNote, index}
                {#if raidNote.attrs.assignedReviewerId != null}
                    <p class="raid"><strong>{raidNames[index]}</strong> reviewer: {raidNote.attrs.assignedReviewerId}</p>
                    {#if 'note' in raidNote.attrs}
                        <p class="review">{@html raidNote.attrs.note.replace(/\n/g, '<br />')}</p>
                    {/if}
                {/if}
            {/each}
        {/if}
    </div>
</div>

<div class="flex-grid">
    <div>
        <h2>Exams</h2>
        <div class="scrollable">
            <table>
                <thead>
                    <tr>
                        <td>level</td>
                        <td>exercise</td>
                        <td>xp</td>
                    </tr>
                </thead>
                {#each Object.keys(exams) as key, index (key)}
                    <tr>
                        <td colspan="3"><strong>{examNames[index]}</strong></td>
                    </tr>
                    {#each exams[key] as exercise, jndex (exercise)}
                        <tr>
                            <td>{jndex+1}</td>
                            <td>{exerciseNames[exercise.attrs.objectId]}</td>
                            <td>{exercise.amount}</td>
                        </tr>
                    {/each}
                {/each}
            </table>
        </div>
    </div>
    <div>
        <h2>Quests</h2>
        <div class="scrollable">
            <table>
                <thead>
                    <tr>
                        <td>success</td>
                        <td>exercise</td>
                        <td>attempts</td>
                    </tr>
                </thead>
                {#each Object.keys(quests) as key (key)}
                    <tr>
                        <td colspan="3"><strong>{key}</strong></td>
                    </tr>
                    {#each Object.keys(quests[key]) as exercise (exercise)}
                        <tr>
                            <td>{quests[key][exercise].done ? '✅' : '❌'}</td>
                            <td>{exercise}</td>
                            <td>{quests[key][exercise].attempts+1}</td>
                        </tr>
                    {/each}
                {/each}
            </table>
        </div>
    </div>
</div>

{:else}
    <div transition:fade>
        <Loading/>
    </div>
{/if}

<style>
p {
    margin: 0;
}
.raid {
    margin-top: 1rem;
}

.review {
    padding: 15px;
    background-color: rgba(242,243,244, 0.6);
    border: 1px solid #ddd;
    border-radius: 5px;
}

.scrollable {
    height:25rem;
    overflow:auto;
}

table {
  clear: both;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 3px;
  border-collapse: collapse;
  color: #444;
}
td {
  text-align: center;
  vertical-align: middle;
  border-right: 1px solid #ddd;
  border-top: 1px solid #ddd;
  width: 14.28571429%;
}

</style>