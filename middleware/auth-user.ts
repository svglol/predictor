export default defineNuxtRouteMiddleware(to => {
  const { session } = useAuth()
  if (session.value) return navigateTo(to.fullPath)
  else if (to.path !== '/login') {
    if (to.path !== '/') return navigateTo('/login?callbackUrl=' + to.fullPath)
    else return navigateTo('/login')
  }
})
