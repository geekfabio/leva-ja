import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { PropsWithChildren, useEffect, useState } from 'react';
import { paperTheme } from '@/theme/paperTheme';
import { useServiceStore } from '@/stores/useServiceStore';
import { useProviderStore } from '@/stores/useProviderStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { DataBootstrap } from './DataBootstrap';

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }));

  // Os dados mockados vivem nas stores: qualquer alteração invalida as consultas correspondentes.
  useEffect(() => {
    const subs = [
      useServiceStore.subscribe(() => queryClient.invalidateQueries({ queryKey: ['service'] })),
      useProviderStore.subscribe(() => queryClient.invalidateQueries({ queryKey: ['provider'] })),
      useAccountStore.subscribe(() => queryClient.invalidateQueries()),
    ];
    return () => subs.forEach((unsubscribe) => unsubscribe());
  }, [queryClient]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          <BottomSheetModalProvider>
            <DataBootstrap>{children}</DataBootstrap>
          </BottomSheetModalProvider>
        </PaperProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
