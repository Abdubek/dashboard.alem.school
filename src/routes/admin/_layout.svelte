<script context="module">
    import {getRoles} from '../../tools/auth';
    export function preload(page, session) {
        if (process.browser) {
            let roles = getRoles();
            if (!roles.includes("admin")) {
                this.redirect(302, "/");
            }
        }
    }
</script>

<slot></slot>