import React from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { emergenciaList } from "../data/emergencyData";

interface emergencia {
  id: string;
  title: string;
  icon: any;
  steps: any[];
}

interface emergenciaSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectemergencia: (emergencia: emergencia) => void;
}

const emergenciaSelector = ({
  visible,
  onClose,
  onSelectemergencia,
}: emergenciaSelectorProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.centeredView}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Qual é a Emergência?</Text>

          <FlatList
            data={emergenciaList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.courseItem}
                onPress={() => onSelectemergencia(item)}
              >
                <Image source={item.icon} style={styles.iconImage} />
                <Text style={styles.courseText}>{item.title}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalView: {
    width: "100%",
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF4B4B",
    marginBottom: 20,
  },
  courseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    width: "100%",
  },
  iconImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    marginRight: 15,
  },
  courseText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  separator: {
    height: 1,
    width: "100%",
    backgroundColor: "#2D2D2D",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#444",
    borderRadius: 12,
    padding: 15,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default emergenciaSelector;
