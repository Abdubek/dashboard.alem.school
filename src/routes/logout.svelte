<script context="module">
    export async function preload(page, session) {
        if (process.browser) {
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("access_token");
            this.redirect(302, "/")
        }
    }
</script>