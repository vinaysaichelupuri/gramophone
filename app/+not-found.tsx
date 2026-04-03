import { Link, Stack, usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { playNow } from '@/services/playerService';
import { titleFromFilePath } from '@/utils/formatters';
import { COLORS } from '@/utils/colors';

import RNFS from 'react-native-fs';

export default function NotFoundScreen() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let unmounted = false;

    const handleUrl = async (url: string | null) => {
      if (!url || unmounted) return;
      try {
        const decodedUrl = decodeURIComponent(url);
        if (decodedUrl.startsWith('file://') || decodedUrl.startsWith('content://')) {
          const normalizedPath = decodedUrl.startsWith('file://') ? decodedUrl.slice(7) : decodedUrl;
          
          let title = titleFromFilePath(decodedUrl);
          try {
            const stat = await RNFS.stat(decodedUrl);
            if (stat && stat.originalFilepath) {
              title = titleFromFilePath(stat.originalFilepath);
            } else if (stat && stat.path && stat.path !== decodedUrl) {
              title = titleFromFilePath(stat.path);
            } else if (stat && (stat as any).name) { // Use name if available
              title = titleFromFilePath((stat as any).name);
            }
          } catch (statErr) {
            console.log('Could not stat intent URL, using fallback title', statErr);
          }

          const mockSong = {
            id: normalizedPath,
            title: title,
            artist: 'Unknown Artist',
            path: normalizedPath,
          };
          
          await playNow(mockSong);
          if (!unmounted) router.replace('/now-playing');
        }
      } catch (err) {
        console.error('Failed to handle intent URL:', err);
      }
    };

    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => {
      unmounted = true;
      subscription.remove();
    };
  }, [pathname, router]);

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!', headerStyle: { backgroundColor: COLORS.background } }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryText,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.accent,
  },
});
