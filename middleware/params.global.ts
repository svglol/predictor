export default defineNuxtRouteMiddleware((to) => {
  useState("routeParamId", () => to.params.id)
})
