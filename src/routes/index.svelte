<script>
	import { goto, stores } from '@sapper/app';
	import config from '../tools/config';
    
	const { session } = stores();
	if ($session.auth == true) {
		goto('/leaderboard');
	}
	
	const CLIENT_ID = config.CLIENT_ID;
	const REDIRECT_URI = `${config.URL}/code/`
</script>

<style>
	figure {
		display: flex;
		height: 100%; 
		justify-content: center;
		align-items: center;
	}

	img {
		max-width: 400px;
	}

	a {
		margin: 0 auto;
		padding: 1rem 2rem;
		background-color: white;
		border: 1px solid gray;
		border-radius: 3px;
		font-size: 1rem;
		text-decoration: none;

		-webkit-transition: all 0.2s ease-out;
		-moz-transition: all 0.2s ease-out;
		-o-transition: all 0.2s ease-out;
		transition: all 0.2s ease-out;
	}
	a:hover {
		background-color: black;
		border: 1px solid white;
		color:white;
		border-radius: 5px;
	}
	a:active {
		background-color: white;
		border: 1px solid black;
		color:black;
		border-radius: 2px;
	}
</style>

<svelte:head>
	<title>dashboard | alem</title>
</svelte:head>

<figure>
	<div class="login">
		<img alt='alem logo' src='alem.svg'>
		<a href="https://git.01.alem.school/login/oauth/authorize/?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code">sign in</a>
	</div>
</figure>
