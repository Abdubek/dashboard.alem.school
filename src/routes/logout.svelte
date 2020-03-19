<script>
    import { goto, stores } from '@sapper/app';
	import { post } from 'utils.js';
    
    const {session} = stores();

    post(`auth/logout`).then(() => {
        $session.user = null;
        $session.auth = null;
        $session.roles = null;
        goto('/');
    });
</script>