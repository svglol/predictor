export default defineNuxtRouteMiddleware(() => {
  const { session } = useAuth()
  if (session.value?.user?.role !== 'ADMIN')
    return abortNavigation()
})
