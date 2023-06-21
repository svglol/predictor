import { Role } from "@prisma/client"

export default defineNuxtRouteMiddleware(() => {
  const { data } = useAuth()
  if ((data.value?.user?.role as unknown as Role) === Role.ADMIN) return
  if ((data.value?.user?.role as unknown as Role) === Role.EDITOR) return
  else return abortNavigation()
})
