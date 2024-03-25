export function useClient() {
  const { $client } = useNuxtApp()
  return $client
}
