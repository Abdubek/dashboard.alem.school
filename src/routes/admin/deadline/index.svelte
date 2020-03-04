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
    let students = [];
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
        const data = resp.data;
        let users = data.users;
        for (let i = 0; i < users.length; i++) {
            for (var key in data) {
                if (key === 'users') {
                    continue;
                }
                let found = false;
                for (let j = 0; j < data[key].length; j++) {
                    if (users[i].user.id == data[key][j].user.id) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    if (users[i].unfinished == null) {
                        users[i].unfinished = [];
                    }
                    users[i].unfinished.push(key);
                }
            }
        }
        users = users.filter(elem => {
            return (elem.unfinished != null);
        });
        students = users;
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