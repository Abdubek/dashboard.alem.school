<div class="box">
  <div class="block">
    <h3>Бассейны</h3>
    <table>
        {#each piscines as piscine (piscine.id)}
            <tr>
                <td><a class="full" target="_blank" href="/admin/piscine/{piscine.id}">{piscine.createdAt} - {piscine.endAt}</a></td>
                <td>{piscine.users_aggregate.aggregate.count}</td>
            </tr>
        {:else}
        <tr>
            <td colspan="2">Loading...</td>
        </tr>
        {/each}
        <tr>
            <td colspan="2"><a href="/">Открыть</a></td>
        </tr>
    </table>
  </div>
  <div class="block">
    <h3>Статистика</h3>
    <table>
        <tr>
            <td>Возраст</td>
        </tr>
        <tr>
            <td>Пол</td>
        </tr>
        <tr>
            <td>Страна</td>
        </tr>
        <tr>
            <td>Город</td>
        </tr>
    </table>
  </div>
  <div class="block">
    <h3>Пользователи</h3>
    <table>
        {#each lastUsers as user (user.id)}
            <tr>
                <td>{user.githubLogin}</td>
            </tr>
        {:else}
            <tr>
                <td>Loading...</td>
            </tr>
        {/each}
        <tr>
            <td><a href="/">Открыть</a></td>
        </tr>
    </table>
  </div>
</div>

<div class="box">
  <div class="block border">
    <h3>Сыграло toad</h3>
    <h4>{toadToday}</h4>
  </div>
  <div class="block border">
    <h3>Активных студентов</h3>
    <h4>{userActiveToday}</h4>
    
  </div>
  <div class="block border">
    <h3>Зарегистрировано</h3>
    <h4>{userToday}</h4>
  </div>
</div>

<div class="box">
  <div class="block">
    <h3>Списки</h3>
    <table>
        <tr>
            <td><a class="full" target="_blank" href="/admin/deadline">Незакончившие проекты</a></td>
        </tr>
    </table>
  </div>
</div>

<script>
    import {onMount} from 'svelte';
    import {zeroPad} from '../../tools/tools';
    import config from '../../tools/config';
    import {customFetch} from '../../tools/auth';


    let fetchedData = {};
    let toadToday = 'Loading...';
    let userToday = 'Loading...';
    let userActiveToday = 'Loading...';
    let lastUsers = [];
    let piscines = [];

    onMount(() => {
        customFetch(`${config.API_URL}/admin`).then(resp => {
            return resp.json();
        }).then(data => {
            for (var key in data) {
                fetchedData[key] = JSON.parse(data[key]);
            }
            toadToday = fetchedData["toadTodayQuery"].data.toad_sessions_aggregate.aggregate.count;
            userToday = fetchedData["userCreatedTodayQuery"].data.user_aggregate.aggregate.count;
            userActiveToday = fetchedData["userActiveTodayQuery"].data.user_aggregate.aggregate.count;
            lastUsers = fetchedData["usersLastRegistered"].data.user;
            piscines = fetchedData["lastPiscines"].data.event;
            for (let i = 0; i < piscines.length; i++) {
                let created = new Date(piscines[i].createdAt);
                let end = new Date(piscines[i].endAt);
                piscines[i].createdAt = `${zeroPad(created.getDate(), 2)}.${zeroPad(created.getMonth()+1, 2)}.${created.getFullYear()}`;
                piscines[i].endAt = `${zeroPad(end.getDate(), 2)}.${zeroPad(end.getMonth()+1, 2)}.${end.getFullYear()}`;
            }
        }).catch(err => {
            console.log("Error:", err);
        });
    });
</script>

<style>
.box {
    display: flex;
    justify-content: space-between;
}
.box .block {
    margin: 0.5rem;
    width: 15rem;
}

.border {
    border: 1px solid gray;
}

table {
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

table td {
  border: 1px solid gray;
  padding: 5px;
}

h3, h4 {
    padding: 0.5rem 0 0 0.5rem;
}

.border h4 {
    text-align: center;
}

.full {
    width: 100%;
    height: 100%;
    text-decoration: none;
}

</style>
