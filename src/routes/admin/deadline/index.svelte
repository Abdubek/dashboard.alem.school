<h1>Незакончившие проекты</h1>

{#each projects as project (project.id)}
    <label>
		<input type=checkbox bind:group={checkedObjects} value={project}>
		{project.name}
	</label>
{/each}
<button on:click="{getStudents}">Get</button>

<table>
  <tr>
    <th>№</th>
    <th>personal</th>
    <th>mandatories</th>
    <th>optionals</th>
    <th>exam</th>
  </tr>
  {#each students as student, index (student.id)}
    <tr>
        <td>{index+1}</td>
        <td>
            {student.githubLogin}<br>
            {student.firstName} {student.lastName}<br>
            {student.email}<br>
            {student.tel}
        </td>
        <td>
        {#each student.deadline.mandatories as project}
            {project}<br>
        {/each}
        </td>
        <td>
        {#if student.deadline.optionals.amount > 0}
        Left: {student.deadline.optionals.amount}<br>
        {/if}

        {#each Object.keys(student.deadline.optionals.special) as optional}
            {#if student.deadline.optionals.special[optional] > 0}
            {optional}: {student.deadline.optionals.special[optional]}<br>
            {/if}
        {/each}
        </td>

        <td>
            {student.deadline.exams}
        </td>
        

    </tr>
  {:else}
  <tr>
    <td colspan="6">
        Loading...
    </td>
  </tr>
  {/each}
</table>

<script>
    import {onMount} from 'svelte';
    import {customFetch} from '../../../tools/auth';
    import config from '../../../tools/config';

    let checkedObjects = [];
    let projects = [];
    let users = {};
    let students = {};

    let rules = {
        mandatories: [
            {
                name: 'go_reloaded'
            },
            {
                name: 'ascii_art'
            },
            {
                name: 'ascii_art_web'
            },
            {
                name: 'groupie_tracker'
            },
            {
                name: 'lem_in'
            }
        ],
        optionals: {
            special: {
                'groupie_tracker': 1
            },
            amount: 3
        },
        exams: {
            minimum: 5,
            amount: 2
        }
    };

    onMount(() => {
        customFetch(`${config.API_URL}/object/3357/children`).then(resp => {
            if (!resp.ok) {
                throw new Error("error on fetch");
            }
            return resp.json();
        }).then(resp => {
            let children = resp.data.object_child;
            for (let i = 0; i < children.length; i++) {
                projects.push(children[i].child);
            }
            projects = projects;
        }).catch(err => {
            console.log(`Error: ${err}`);
        });
    });

    async function getStudents(event) {
        console.log(checkedObjects);
        if (checkedObjects.length == 0) {
            return;
        }
        let postBody = [];
        for (let i = 0; i < checkedObjects.length; i++) {
            postBody.push({
                ID:checkedObjects[i].id,
                Name: checkedObjects[i].name
            });
        }
        let resp = await customFetch(`${config.API_URL}/deadline/`, {
            method: 'POST',
            body: JSON.stringify(postBody),
        });
        resp = await resp.json();
        // iterate over users
        const usersList = resp.data.users;
        for (let i = 0; i < usersList.length; i++) {
            const user = usersList[i].user;
            users[user.id] = {...user};
            users[user.id].finished = {};
            users[user.id].deadline = {
                mandatories: [],
                optionals: {
                    special: {
                        ...rules.optionals.special
                    },
                    amount: rules.optionals.amount
                },
                exams: rules.exams.amount
            };
        }
        // iterate over projects
        for (let key in resp.data) {
            if (key == 'users') {continue;}
            // iterate over those who finished the project
            for (let i = 0; i < resp.data[key].length; i++) {
                const userID = resp.data[key][i].user.id;
                const projectType = resp.data[key][i].object.attrs;
                users[userID].finished[key] = projectType;
            }
        }

        // deadliners
        let deadliners = [];
        for (let userID in users) {
            // mandatories
            for (let i = 0; i < rules.mandatories.length; i++) {
                let project = rules.mandatories[i];
                if (!(project.name in users[userID].finished)) {
                    users[userID].deadline.mandatories.push(project.name);
                }
            }
            // optionals
            let optionalsAmount = 0;
            for (let optional in users[userID].deadline.optionals.special) {
                for (let project in users[userID].finished) {
                    if (users[userID].finished[project] == 'enrichment') {
                        if (project.startsWith(optional)
                            && users[userID].deadline.optionals.special[optional] > 0) {
                            users[userID].deadline.optionals.special[optional]--;
                        }
                        optionalsAmount++;
                    }
                }
            }
            users[userID].deadline.optionals.amount -= optionalsAmount;
            if (users[userID].deadline.optionals.amount < 0) {
                users[userID].deadline.optionals.amount = 0;
            }

            // exam
            for (let key in users[userID]) {
                if (!(key.startsWith('exam'))) {continue;}
                const examLevel = users[userID][key].aggregate.count;
                if (examLevel >= rules.exams.minimum && users[userID].deadline.exams > 0) {
                    users[userID].deadline.exams--;
                }
            }

            let added = false;
            // push to deadliners
            if (users[userID].deadline.mandatories.length > 0 ||
                users[userID].deadline.exams > 0 ||
                users[userID].deadline.optionals.amount > 0) {
                deadliners.push(users[userID]);
                added = true;
            }
            // push to deadliners if one of specials not finished
            if (!added) {
                for (let optional in users[userID].deadline.optionals.special) {
                   if (users[userID].deadline.optionals.special[optional] > 0) {
                        deadliners.push(users[userID]);
                    }
                }
            }
        }
        console.log(deadliners);
        students = deadliners;
    }
</script>

<style>
label {
    display: block;
}
table {
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

table td, table th {
  border: 1px solid white;
  padding: 8px;
}

table th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #1724cd;
  color: white;
}

input {
    margin-bottom: 1rem;
}

</style>