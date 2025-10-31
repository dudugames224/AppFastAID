import React from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Step {
  title: string;
  description: string;
}

interface emergenciaStepsModalProps {
  visible: boolean;
  onClose: () => void;
  emergencia: {
    title: string;
    steps: Step[];
  } | null;
}

const emergenciaStepsModal = ({
  visible,
  onClose,
  emergencia,
}: emergenciaStepsModalProps) => {
  if (!emergencia) return null;

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
        <View style={styles.modalView} onStartShouldSetResponder={() => true}>
          <Text style={styles.modalTitle}>{emergencia.title}</Text>

          <FlatList
            style={styles.list}
            data={emergencia.steps}
            keyExtractor={(item) => item.title}
            renderItem={({ item }) => (
              <View style={styles.stepItem}>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDescription}>{item.description}</Text>
              </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalView: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF4B4B",
    marginBottom: 20,
  },
  list: {
    width: "100%",
  },
  stepItem: {
    paddingVertical: 15,
    width: "100%",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 16,
    color: "#A9A9A9",
    lineHeight: 22,
  },
  separator: {
    height: 1,
    width: "100%",
    backgroundColor: "#2D2D2D",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#FF4B4B",
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

export default emergenciaStepsModal;
