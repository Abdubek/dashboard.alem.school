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
            user = resp.user.data.user[0];
            exams = resp.exams.data;
            raidNotes = resp.raidNotes.data.progress;
            toad = resp.toad.data.progress[0].attrs;
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
</script>

{#if user}
    <h2>{user.firstName} {user.lastName}</h2>
    <p>{user.githubLogin}</p>
{/if}

{#if toad}
    <h3>Toad</h3>
    {#if 'attempts' in toad}
        <p>Attempts: {toad.attempts.length+1}</p>
    {/if}
    <p>Score: {toad.score}</p>
    <p>Memory: {toad.games[0].results.length}</p>
    <p>Zzle: {toad.games[1].results.length}</p>
{/if}

{#if raidNotes}
    <h3>Raid</h3>
    {#each raidNotes as raidNote, index}
        <h3>{raidNames[index]}</h3>
        <p>{raidNote.attrs.assignedReviewerId}</p>
        <p>{@html raidNote.attrs.note.replace(/\n/g, '<br />')}</p>
    {/each}
{/if}

{#if exams}
    <h3>Exams</h3>
    {#each Object.keys(exams) as key, index (key)}
        <h3>{examNames[index]}</h3>
        {#each exams[key] as exercise, jndex (exercise)}
            <p>{jndex+1}. {exercise.amount}xp, {exerciseNames[exercise.attrs.objectId]}</p>
        {/each}
    {/each}
{/if}

{#if quests}
    <h3>Quests</h3>
    {#each Object.keys(quests) as key (key)}
        <h3>{key}</h3>
        {#each Object.keys(quests[key]) as exercise (exercise)}
            <p>{quests[key][exercise].done ? '✅' : '❌'} {exercise}, {quests[key][exercise].attempts} attempts</p>
        {/each}
    {/each}
{/if}