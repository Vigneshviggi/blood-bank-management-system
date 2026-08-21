import React from 'react';
import { TouchableOpacity, Linking, Text } from 'react-native';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';

export function ExternalLink({ href, children, style }) {
  return (
    <TouchableOpacity
      style={style}
      onPress={async () => {
        try {
          await openBrowserAsync(href, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          });
        } catch {
          Linking.openURL(href);
        }
      }}
    >
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </TouchableOpacity>
  );
}

