import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  SectionList,
} from "react-native";

const InternationalCodeSelector = ({ selectedCountry, onSelectCountry }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [countries, setCountries] = useState([]);
  const [sections, setSections] = useState([]);

  // Fetch countries from RestCountries API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();

        // Format the data to match your component's structure
        const formattedCountries = data.map((country) => {
          const root = country.idd?.root || "";
          const suffixes = country.idd?.suffixes || [];

          // Remove the extra '+' by checking if root already starts with '+'
          const cleanedRoot = root.startsWith("+") ? root.slice(1) : root;
          const code = suffixes.length > 0 ? `+${cleanedRoot}${suffixes[0]}` : `+${cleanedRoot}`;

          return {
            name: country.name.common,
            code: code,
            flag: country.flag,
          };
        });

        // Sort countries alphabetically by name
        const sortedCountries = formattedCountries.sort((a, b) => 
          a.name.localeCompare(b.name)
        );

        setCountries(sortedCountries);

        // Create initial sections for the list
        updateSections(sortedCountries, "");
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  // Update sections based on search text
  const updateSections = useCallback((allCountries, query) => {
    if (!query) {
      // Define popular countries (could be based on usage statistics or preferences)
      // For this example, we'll use a predefined list of popular country codes
      const popularCountryCodes = ["+1", "+44", "+61", "+62"]; // US, UK, Australia, Indonesia
      
      // Get popular countries from the full list
      const popularCountries = allCountries
        .filter(country => popularCountryCodes.includes(country.code))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      // Set up sections with both popular and all countries
      setSections([
        { title: "Popular countries", data: popularCountries },
        { title: "All countries", data: allCountries }
      ]);
    } else {
      // When searching, just show filtered results without sections
      const filtered = allCountries.filter(
        (country) =>
          country.name.toLowerCase().includes(query.toLowerCase()) ||
          country.code.includes(query)
      );
      setSections([{ title: "", data: filtered }]);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      updateSections(countries, searchText);
    }, 300); // 300ms delay

    return () => clearTimeout(debounceTimeout);
  }, [searchText, countries, updateSections]);

  const openModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSearchText("");
    // Reset sections when closing modal
    updateSections(countries, "");
  }, [countries, updateSections]);

  const handleSelectCountry = useCallback(
    (country) => {
      onSelectCountry(country);
      closeModal();
    },
    [onSelectCountry, closeModal]
  );

  const renderSectionHeader = useCallback(({ section }) => {
    if (!section.title || searchText) return null;
    
    return (
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
    );
  }, [searchText]);

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => handleSelectCountry(item)}
    >
      <Text style={styles.flagEmoji}>{item.flag}</Text>
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.countryCode}>{item.code}</Text>
    </TouchableOpacity>
  ), [handleSelectCountry]);

  return (
    <>
      <TouchableOpacity style={styles.countryCodeButton} onPress={openModal}>
        <Text style={styles.flagEmoji}>{selectedCountry.flag}</Text>
        <Text style={styles.countryCodeText}>{selectedCountry.code}</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />

          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Search country code</Text>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Type country name or country code"
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={setSearchText}
                autoCapitalize="none"
              />
            </View>
          </View>

          <SectionList
            sections={sections}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            keyExtractor={(item) => `${item.name}-${item.code}`}
            stickySectionHeadersEnabled={false}
            getItemLayout={(data, index) => ({
              length: 60, // Height of each item
              offset: 60 * index,
              index,
            })}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={10}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 8,
  },
  flagEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCodeText: {
    fontSize: 16,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: "#333",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    marginLeft: 8,
  },
  searchContainer: {
    padding: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: "#999",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  sectionHeaderContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginVertical: 8,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  countryCode: {
    fontSize: 16,
    color: "#666",
  },
});

export default InternationalCodeSelector;