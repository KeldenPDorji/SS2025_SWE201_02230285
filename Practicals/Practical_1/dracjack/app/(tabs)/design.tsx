import React, { useState, useCallback, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Image,
  Modal
} from "react-native";
import { useRouter } from "expo-router";
import InternationalCodeSelector from "../../components/country"; // Adjust path as needed
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LANGUAGE_STORAGE_KEY, AVAILABLE_LANGUAGES, Language } from "./index"; // Import the language constants

const PhoneNumberScreen = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState({
    name: "Indonesia",
    code: "+62",
    flag: "🇮🇩"
  });
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(AVAILABLE_LANGUAGES[0]);
  
  // Load the saved language on component mount
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage) {
          const langObj = JSON.parse(savedLanguage);
          setSelectedLanguage(langObj);
        }
      } catch (error) {
        console.error("Error loading language preference:", error);
      }
    };

    loadLanguagePreference();
  }, []);
  
  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);
  
  const handleContinue = useCallback(() => {
    // Validate phone number then proceed
    if (phoneNumber.length > 0) {
      // Navigate to verification screen
      router.push("/verification");
    }
  }, [phoneNumber, router]);
  
  const handleIssueWithNumber = useCallback(() => {
    // Open help dialog or navigate to support page
    alert("Support options will appear here");
  }, []);

  const handlePhoneNumberChange = useCallback((text) => {
    // Only allow numbers to be entered
    const cleaned = text.replace(/[^0-9]/g, "");
    setPhoneNumber(cleaned);
  }, []);

  const handleSelectCountry = useCallback((country) => {
    setSelectedCountry(country);
  }, []);

  const toggleLanguageModal = useCallback(() => {
    setLanguageModalVisible(!languageModalVisible);
  }, [languageModalVisible]);

  const selectLanguage = useCallback(async (language: Language) => {
    setSelectedLanguage(language);
    setLanguageModalVisible(false);
    
    // Save selected language to AsyncStorage
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(language));
    } catch (error) {
      console.error("Error saving language preference:", error);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpIcon}>?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.languageButton} onPress={toggleLanguageModal}>
          <Text style={styles.languageText}>{selectedLanguage.emoji} {selectedLanguage.name}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Gojek!</Text>
        <Text style={styles.subtitle}>Enter or create an account in a few easy steps.</Text>
        
        {/* Phone Number Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>
            Phone number<Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          
          <View style={styles.phoneInputContainer}>
            <InternationalCodeSelector
              selectedCountry={selectedCountry}
              onSelectCountry={handleSelectCountry}
            />
            
            <TextInput
              style={styles.phoneInput}
              placeholder="81x-xxx-xxx"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
            />
          </View>
          
          {/* Continue Button */}
          <TouchableOpacity 
            style={[styles.continueButton, phoneNumber.length > 0 ? styles.continueButtonActive : {}]} 
            onPress={handleContinue}
            disabled={phoneNumber.length === 0}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
          
          {/* Terms Agreement */}
          <Text style={styles.termsText}>
            I agree to Gojek's{" "}
            <Text style={styles.termsLink}>Terms of Service</Text> &{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
          
          {/* Issue with number */}
          <TouchableOpacity style={styles.issueButton} onPress={handleIssueWithNumber}>
            <Text style={styles.issueButtonText}>Issue with number?</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>from</Text>
        <Image 
          source={require("../../assets/GoTo_logo.png")} 
          style={styles.gotoLogo} 
          resizeMode="contain"
        />
      </View>

      {/* Language Selection Modal - Shared between screens */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={toggleLanguageModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={toggleLanguageModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>Change language</Text>
              <Text style={styles.modalSubtitle}>Which language do you prefer?</Text>
              
              {AVAILABLE_LANGUAGES.map((language, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.languageOption}
                  onPress={() => selectLanguage(language)}
                >
                  <Text style={styles.languageOptionText}>{language.emoji} {language.name}</Text>
                  {selectedLanguage.code === language.code ? (
                    <View style={styles.radioSelected}>
                      <View style={styles.radioInner} />
                    </View>
                  ) : (
                    <View style={styles.radioUnselected} />
                  )}
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity 
                style={styles.continueLanguageButton}
                onPress={toggleLanguageModal}
              >
                <Text style={styles.continueLanguageText}>Continue in {selectedLanguage.name}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: "#333",
  },
  helpButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
    marginRight: 12,
  },
  helpIcon: {
    fontSize: 18,
    color: "#333",
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  languageText: {
    fontSize: 14,
    color: "#333",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 32,
  },
  inputSection: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 12,
    fontWeight: "500",
  },
  requiredAsterisk: {
    color: "#FF0000",
  },
  phoneInputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
  },
  continueButton: {
    backgroundColor: "#CCCCCC",
    borderRadius: 30,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  continueButtonActive: {
    backgroundColor: "#00AA13",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  termsText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
  },
  termsLink: {
    color: "#00AA13",
  },
  issueButton: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
  },
  issueButtonText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: "#666666",
    marginRight: 8,
  },
  gotoLogo: {
    width: 80,
    height: 24,
  },
  // Modal Styles - Using same styles from OnboardingScreen
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    alignItems: 'flex-end',
    padding: 15,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#333",
  },
  modalBody: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  languageOptionText: {
    fontSize: 16,
  },
  radioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00AA13',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00AA13',
  },
  radioUnselected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  continueLanguageButton: {
    backgroundColor: "#00AA13",
    borderRadius: 30,
    padding: 16,
    alignItems: "center",
    marginTop: 40,
  },
  continueLanguageText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default React.memo(PhoneNumberScreen);