import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			// Keep data fresh for 60 s before refetching — critical on 3G to avoid
			// re-downloading the same data every time a component mounts.
			staleTime: 60_000,
			// Hold unused data in cache for 5 min so navigating back feels instant.
			gcTime: 5 * 60 * 1000,
		},
	},
});