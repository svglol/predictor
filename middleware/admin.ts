export default defineNuxtRouteMiddleware(() => {
  const { data } = useAuth()
  if (data.value?.user?.role === "ADMIN" || data.value?.user?.role === "EDITOR")
    return
  else return abortNavigation()
})
