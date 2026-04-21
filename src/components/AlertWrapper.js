import { useEffect, useMemo, useState } from "react";
import {
    Animated,
    Dimensions,
    Keyboard,
    PanResponder,
    Platform,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from "react-native";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const AlertWrapper = ({ children, containerStyle, isShow, close, onFocus }) => {
    const insets = useSafeAreaInsets();

    const [isMounted, setIsMounted] = useState(isShow);
    const [translateY] = useState(() => new Animated.Value(SCREEN_HEIGHT));

    const panResponder = useMemo(() => {
        return PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gs) => gs.dy > 10,
            onPanResponderMove: (_, gs) => {
                if (gs.dy > 0) translateY.setValue(gs.dy);
            },
            onPanResponderRelease: (_, gs) => {
                if (gs.dy > 120 || gs.vy > 0.5) {
                    Animated.timing(translateY, {
                        toValue: SCREEN_HEIGHT,
                        duration: 150,
                        useNativeDriver: true,
                    }).start(() => {
                        setIsMounted(false);
                        close();
                    });
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        });
    }, [translateY, close]);

    const backdropColor = translateY.interpolate({
        inputRange: [0, SCREEN_HEIGHT],
        outputRange: ["rgba(0,0,0,0.5)", "rgba(0,0,0,0)"],
    });

    useEffect(() => {
        let timeoutId;
        if (isShow) {
            timeoutId = setTimeout(() => {
                setIsMounted(true);
            }, 0);

            if (onFocus) onFocus();

            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                damping: 25,
                stiffness: 190,
            }).start();
        } else if (isMounted) {
            Keyboard.dismiss();

            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setIsMounted(false);
            });
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isShow]);

    if (!isMounted) return null;

    return (
        <Animated.View style={[styles.modal, { backgroundColor: backdropColor }]}>
            <KeyboardAwareScrollView
                enableOnAndroid
                extraScrollHeight={Platform.OS === "ios" ? 20 : 120}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}
                style={{ width: "100%" }}
            >
                <TouchableWithoutFeedback onPress={close}>
                    <View style={{ flex: 1 }} />
                </TouchableWithoutFeedback>

                <Animated.View
                    style={[
                        styles.bottomContainer,
                        containerStyle,
                        {
                            transform: [{ translateY }],
                            paddingBottom: Math.max(insets.bottom, 20),
                        },
                    ]}
                >
                    <View style={styles.handleContainer} {...panResponder.panHandlers}>
                        <View style={styles.handle} />
                    </View>

                    {children}
                </Animated.View>
            </KeyboardAwareScrollView>
        </Animated.View>
    );
};

export default AlertWrapper;

const styles = StyleSheet.create({
    modal: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        justifyContent: "flex-end",
        zIndex: 999,
    },
    bottomContainer: {
        width: "100%",
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
    },
    handleContainer: {
        alignItems: "center",
        paddingTop: 15,
        paddingBottom: 25,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
    },
});
