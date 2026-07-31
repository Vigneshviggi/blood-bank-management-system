import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Search, X, User } from 'lucide-react-native';
import api from '../services/api';
import EmptyStateView from '../components/EmptyStateView';
import Toast from 'react-native-toast-message';

export default function GlobalSearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(text)}&filter=donors`);
      setResults(Array.isArray(res.data?.users) ? res.data.users : []);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Search failed', text2: error.response?.data?.error || error.message });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={[styles.resultItem, { borderBottomColor: colors.border }]}
        onPress={() => {
          // Navigate based on item type
          // navigation.navigate('UserProfile', { userId: item._id });
        }}
      >
        <User size={20} color={colors.primary} style={styles.icon} />
        <View style={styles.resultInfo}>
          <Text style={[styles.resultTitle, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>
            {item.bloodGroup} • {item.city}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Search users, camps, requests..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          <Text style={[styles.cancelText, { color: colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            query.length >= 3 ? (
              <EmptyStateView title="No results" message={`We couldn't find anything matching "${query}"`} />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 8,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  cancelBtn: {
    marginLeft: 16,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loader: {
    marginTop: 40,
  },
  list: {
    padding: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  icon: {
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});
