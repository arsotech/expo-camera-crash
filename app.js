import { useState, useEffect } from "react";
import { CameraView, Camera } from "expo-camera/next";
import { useSharedValue, useAnimatedStyle } from "react-native-reanimated";
import styles from "@styles";
import Animated, {
  Easing,
  withTiming,
  withRepeat,
} from "react-native-reanimated";
import {
  Text,
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";

const TicketScanner = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanner, setScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const offsetY = useSharedValue(0);

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getPermissions();
  }, []);

  useEffect(() => {
    if (scanner) {
      offsetY.value = withRepeat(
        withTiming(100, { duration: 500, easing: Easing.linear }),
        -1,
        true
      );
    } else {
      offsetY.value = withTiming(0, { duration: 500, easing: Easing.linear });
    }
  }, [scanner]);

  const lineStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: offsetY.value }],
    };
  });

  const handleScan = async (info) => {
    try {
      if (!scanner) return;
      const { data: qrCode } = info;
      setScanning(true);
      setScanner(false);
      /// do checks
      Alert.alert("Success", "Scanned");
    } catch (e) {
      console.log("Error handle scan", e);
    } finally {
      setScanning(false);
    }
  };

  const renderView = () => {
    if (!hasPermission) {
      return (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: 30,
          }}
        >
          <Text style={[styles.pDark, styles.textCenter]}>
            Need to give permission to use your camera to scan tickets
          </Text>
        </View>
      );
    } else {
      return (
        <>
          <CameraView
            style={localStyles.scanner}
            onBarcodeScanned={scanning || !scanner ? undefined : handleScan}
            barcodeScannerSettings={{
              barCodeTypes: [
                "qr",
                "aztec",
                "ean13",
                "ean8",
                "pdf417",
                "upc_e",
                "datamatrix",
                "code39",
                "code93",
                "itf14",
                "codabar",
                "code128",
                "upc_a",
              ],
            }}
          >
            <View style={localStyles.scannerBack}>
              {!scanner && scanning && (
                <View style={{ gap: 5, alignItems: "center" }}>
                  <ActivityIndicator animating={scanning} />
                  <Text style={[styles.pLight, styles.textCenter]}>
                    Validating
                  </Text>
                </View>
              )}
              {scanner && (
                <Animated.View style={[localStyles.line, lineStyle]} />
              )}
            </View>
            <View style={[localStyles.corner, localStyles.topLeft]} />
            <View style={[localStyles.corner, localStyles.topRight]} />
            <View style={[localStyles.corner, localStyles.bottomLeft]} />
            <View style={[localStyles.corner, localStyles.bottomRight]} />
          </CameraView>
          <View style={{ paddingHorizontal: 24 }}>
            <Pressable
              onPress={
                scanner ? () => setScanner(false) : () => setScanner(true)
              }
            >
              <Text>{scanner ? "Turn Off" : "Turn On"}</Text>
            </Pressable>
          </View>
        </>
      );
    }
  };

  return <View style={{ flex: 1, padding: 50 }}>{renderView()}</View>;
};

export default TicketScanner;

const localStyles = StyleSheet.create({
  scanner: { height: 280 },
  scannerBack: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 20,
    justifyContent: "center",
  },
  line: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.5)",
    top: -50,
  },
  corner: {
    position: "absolute",
    borderColor: "rgba(255,255,255,0.5)",
    borderWidth: 3,
    width: 20,
    height: 20,
  },
  topLeft: {
    top: 15,
    left: 15,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 15,
    right: 15,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 15,
    left: 15,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 15,
    right: 15,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
});
