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
} from "react-native";

const CountryCodeSelector = ({ selectedCountry, onSelectCountry }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [countries, setCountries] = useState([]);

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
          const code = suffixes.length > 5 ? `+${cleanedRoot}` : `+${cleanedRoot}${suffixes.join("")}`;

          return {
            name: country.name.common,
            code: code,
            flag: country.flag,
          };
        });

        setCountries(formattedCountries);
        setFilteredCountries(formattedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  // Debounce search input
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchText) {
        const filtered = countries.filter(
          (country) =>
            country.name.toLowerCase().includes(searchText.toLowerCase()) ||
            country.code.includes(searchText)
        );
        setFilteredCountries(filtered);
      } else {
        setFilteredCountries(countries);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(debounceTimeout);
  }, [searchText, countries]);

  const openModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSearchText("");
  }, []);

  const handleSelectCountry = useCallback(
    (country) => {
      onSelectCountry(country);
      closeModal();
    },
    [onSelectCountry, closeModal]
  );

  const renderPopularSection = () => {
    const popularCountries = filteredCountries.slice(0, 3); // First 3 countries as popular

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Popular countries</Text>
        {popularCountries.map((country) => (
          <TouchableOpacity
            key={`${country.name}-${country.code}`}
            style={styles.countryItem}
            onPress={() => handleSelectCountry(country)}
          >
            <Text style={styles.flagEmoji}>{country.flag}</Text>
            <Text style={styles.countryName}>{country.name}</Text>
            <Text style={styles.countryCode}>{country.code}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => handleSelectCountry(item)}
    >
      <Text style={styles.flagEmoji}>{item.flag}</Text>
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.countryCode}>{item.code}</Text>
    </TouchableOpacity>
  );

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
              />
            </View>
          </View>

          {searchText.length === 0 && renderPopularSection()}

          {searchText.length === 0 && (
            <Text style={styles.sectionTitle}>All countries</Text>
          )}

          <FlatList
            data={filteredCountries}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.name}-${item.code}`}
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
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginVertical: 8,
    paddingHorizontal: 16,
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

export default CountryCodeSelector;