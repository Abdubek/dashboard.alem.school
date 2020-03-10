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
    <th>githubLogin</th>
    <th>name</th>
    <th>surname</th>
    <th>email</th>
    <th>tel</th>
    <th>projects</th>
  </tr>
  {#each students as student, index (student.user.id)}
    <tr>
        <td>{index+1}</td>
        <td>{student.user.githubLogin}</td>
        <td>{student.user.firstName}</td>
        <td>{student.user.lastName}</td>
        <td>{student.user.email}</td>
        <td>{student.user.tel}</td>
        <td>
        {#each student.unfinished as project}
            {project}<br>
        {/each}
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
            minimum: 7,
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
        console.log(resp);
        // iterate over users
        const usersList = resp.data.users;
        for (let i = 0; i < usersList.length; i++) {
            const user = usersList[i].user;
            users[user.id] = {...user};
            users[user.id].finished = {};
            users[user.id].deadline = {
                mandatories: [],
                optionals: rules.optionals,
                exams: rules.exams
            };
        }
        // iterate over projects
        for (let key in resp.data) {
            if (key == 'users') {continue;}
            // iterate over those who finished the project
            for (let i = 0; i < resp.data[key].length; i++) {
                const userID = resp.data[key][i].user.id;
                const projectType = resp.data[key][i].object.attrs;
                console.log(userID);
                users[userID].finished[key] = projectType;
            }
        }

        // deadliners
        let deadliners = [];
        for (let userID in users) {
            // check for mandatories
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
        }

        // let users = data.users;
        // for (let i = 0; i < users.length; i++) {
        //     for (var key in data) {
        //         if (key === 'users') {
        //             continue;
        //         }
        //         let found = false;
        //         for (let j = 0; j < data[key].length; j++) {
        //             if (users[i].user.id == data[key][j].user.id) {
        //                 found = true;
        //                 break;
        //             }
        //         }
        //         if (!found) {
        //             if (users[i].unfinished == null) {
        //                 users[i].unfinished = [];
        //             }
        //             users[i].unfinished.push(key);
        //         }
        //     }
        // }
        // users = users.filter(elem => {
        //     return (elem.unfinished != null);
        // });
        // students = users;
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