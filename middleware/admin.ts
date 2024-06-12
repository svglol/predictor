export default defineNuxtRouteMiddleware(() => {
  const { session } = useAuth()
  if (
    session.value?.user?.role !== 'ADMIN'
    && session.value?.user?.role !== 'EDITOR'
  ) {
    return abortNavigation()
  }
})
