export default defineNuxtRouteMiddleware((to) => {
  const { session } = useAuth()
  if (session.value) return
  else {
    if (to.path !== "/login") {
      return navigateTo("/login")
    }
  }
})
