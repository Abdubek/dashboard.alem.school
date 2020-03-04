
<script>
	export let segment;

	import {getRoles} from '../tools/auth';

	let roles = [];
	if (process.browser) {
		roles = getRoles();
	}
	$: if (segment != -1) {
		roles = getRoles();
	}

	$: isAdmin = roles.includes("admin");
	$: isStudent = roles.includes("student");
	
</script>

<style>
	nav {
		border-bottom: 1px solid rgba(255,62,0,0.1);
		font-weight: 300;
		padding: 0 1em;
	}

	ul {
		margin: 0;
		padding: 0;
	}

	/* clearfix */
	ul::after {
		content: '';
		display: block;
		clear: both;
	}

	li {
		display: block;
		float: left;
	}

	.right {
		float: right;
	}

	.selected {
		position: relative;
		display: inline-block;
	}

	.selected::after {
		position: absolute;
		content: '';
		width: calc(100% - 1em);
		height: 2px;
		background-color: rgb(255,62,0);
		display: block;
		bottom: -1px;
	}

	a {
		text-decoration: none;
		padding: 1em 0.5em;
		display: block;
	}

	img {
		height: 1rem;
	}
</style>

<nav>
	<ul>
		<li><a class:selected='{segment === undefined}' href='.'><img alt='alem logo' src='alem.png'/></a></li>
		{#if isStudent}
		<li><a class:selected='{segment === "leaderboard"}' href='leaderboard'>leaderboard</a></li>
		{/if}

		{#if isAdmin}
		<li><a class:selected='{segment === "admin"}' href='admin'>admin</a></li>
		{/if}

		<!-- for the blog link, we're using rel=prefetch so that Sapper prefetches
		     the blog data when we hover over the link or tap it on a touchscreen -->
		{#if isAdmin || isStudent}
		<li class="right"><a href='logout'>logout</a></li>
		{/if}
		<li class="right"><a target="_blank" href='https://blog.alem.school'>blog</a></li>
		<li class="right"><a target="_blank" href='https://navigation.alem.school'>navigation</a></li>
	</ul>
</nav>
