<script context="module">
    import { goto } from '@sapper/app';
    export async function preload(page, session) {
        if (session.auth == null) {
            goto('/');
        }
    }
</script>

<script>
    import { stores } from '@sapper/app';
    import {onMount} from 'svelte';
    import Table from '../../components/Table.svelte';
    import config from '../../tools/config';
    import {customFetch} from '../../tools/auth';

    const {session} = stores();
    if ($session.auth == null) {
        goto('/');
    }
    let jwt_token = $session.user.jwt_token;    

    const keyNames = {
        'githubLogin': 'login',
        'firstName': 'first name',
        'lastName': 'last name',
        'xp': 'xp',
        'audits': 'audits',
    };
    const ignoreKeys = ['id'];
    let students = [];

    onMount(() => {
        customFetch(`${config.API_URL}/leaderboard`, jwt_token).then(resp => {
            return resp.json();
        }).then(result => {
            const rawData = result.data.event_user;
            // form students array
            students = []
            for (let i = 0; i < rawData.length; i++) {
                let xp = rawData[i].user.xp.aggregate.sum.amount;
                if (xp == null) {xp = 0;}
                const audits = rawData[i].user.audits.aggregate.count;
                const user = rawData[i].user;

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
                students.push({
                    ...user,
                    xp: xp,
                    audits: audits,
                });
            }
            students = students;
        });
    });

    // isSafe function to define whether student is above
    // or under safe zone
    function isSafe(xp) {
        if (xp > 5000+6125+9200+24500+6125+9200) {
            return true;
        }
        return false;
    }
</script>

<Table
    bind:data={students}
    ignoreKeys={ignoreKeys}
    defaultSortKey={'xp'}
    thresholdMode={true}
    thresholdKey={'xp'}
    isSafeFunction={isSafe}
    urlKey={'id'} />