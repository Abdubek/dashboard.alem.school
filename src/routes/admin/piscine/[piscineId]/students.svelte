<!-- <script context="module">
    export async function preload(page, session) {
        const {piscineId} = page.params;
        return {piscineId};
    }
</script>

<script>
    import {onMount} from 'svelte';
    import {query} from 'svelte-apollo';
    import {createClient} from '../../../../tools/apollo';
    import {formatDate} from '../../../../tools/tools';
    import {piscineUsersQuery, piscineIdQuery} from '../../../../queries/queries';
    import Table from '../../../../components/Table.svelte';
    
    export let piscineId;
    const client = createClient();
    const piscineLink = query(client, {query: piscineIdQuery(piscineId)});
    let piscineUsersLink;

    let piscine;
    let piscineUsers;

    const keyNames = {
        'githubLogin': 'login',
        'firstName': 'first name',
        'lastName': 'last name',
        'xp': 'xp',
    };
    const ignoreKeys = ['id'];

    let dates = 'Loading...';

    onMount(() => {
        $piscineLink.then(resp => {
            piscine = resp.data.event[0];
            const created = new Date(piscine.createdAt);
            const end = new Date(piscine.endAt);

            dates = `${formatDate(created)} - ${formatDate(end)}`;

            piscineUsersLink = query(client, {query: piscineUsersQuery(piscineId, piscine.createdAt, piscine.endAt)});            
            $piscineUsersLink.then(resp => {
                const rawData = resp.data.user;
                piscineUsers = [];
                for (let i = 0; i < rawData.length; i++) {
                    let xp = rawData[i].__xp.aggregate.sum.amount;
                    if (xp == null) {xp=0}
                    const user = rawData[i];

                    // manage keys
                    for (var key of Object.keys(user)) {

                        // delete keys that start with "__"
                        if (key.includes("__")) {
                            delete user[key];
                        }

                        // replace names of keys
                        if (key in keyNames) {
                            user[keyNames[key]] = user[key];
                            delete user[key];
                        }
                    }

                    piscineUsers.push({
                        ...user,
                        xp: xp,
                    });
                }
                piscineUsers = piscineUsers;
                console.log(piscineUsers);
            });
        });
    });
</script>

<h1>Участники бассейна</h1>
<h3>{dates}</h3>
<Table
    bind:data={piscineUsers}
    ignoreKeys={ignoreKeys}
    defaultSortKey={'xp'} /> -->