export default defineNuxtRouteMiddleware(to => {
  const { session } = useAuth()
  if (session.value) return
  else {
    if (to.path !== '/login') {
      if (to.path !== '/')
        return navigateTo('/login?callbackUrl=' + to.fullPath)
      else return navigateTo('/login')
    }
  }
})
