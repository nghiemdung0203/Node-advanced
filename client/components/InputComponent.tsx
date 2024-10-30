import React from "react";
import { Image, StyleSheet, TextInput, View } from "react-native";

interface Props {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  iconSource?: any;
  inputpassword?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  height?: number;
}

const InputComponent: React.FC<Props> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  iconSource,
  inputpassword,
  multiline,
  numberOfLines,
  height
}) => {
  return (
    <View style={styles.inputContainer}>
      {iconSource && (
        <Image
          style={inputpassword ? styles.iconPass : styles.icon}
          source={iconSource}
        />
      )}
      <TextInput
        placeholder={placeholder}
        textAlign="left"
        placeholderTextColor="#rgba(130, 129, 135, 1)"
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10
  },
  input: {
    height: 60,
    color: "#fff",
    paddingHorizontal: 15,
    flex: 1,
    alignContent: "flex-start",
  },
  icon: {
    width: 24,
    height: 30,
    marginLeft: 10,
  },
  iconPass: {
    width: 12.69,
    height: 20,
    marginLeft: 16,
  },
});

export default InputComponent;
