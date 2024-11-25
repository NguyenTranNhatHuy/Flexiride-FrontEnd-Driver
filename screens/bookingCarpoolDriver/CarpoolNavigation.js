/* eslint-disable comma-dangle */
import {
    StyleSheet,
    View,
    Pressable,
    Text,
    Dimensions,
    Image,
    Alert,
    Platform,
    PermissionsAndroid,
} from "react-native";
import VietMapNavigation from "@vietmap/vietmap-react-native-navigation";
import { VietMapNavigationController } from "@vietmap/vietmap-react-native-navigation";
import React, { useEffect, useState } from "react";
import { vietmapAPIKey } from "../../../vietmap_config";
import { TouchableOpacity } from "react-native-gesture-handler";
import Images from "./img/index";
import { CheckBox } from "react-native-elements";
import Geolocation from "@react-native-community/geolocation";
import translationGuide from "./trans";

const CarpoolNavigation = ({ navigation, route }) => {
    const { currentLocation, destinationLocation, status, rideInfor } =
        route.params || {};

    const [instructionText, setInstructionText] = useState("");
    const [routeProgressData, setRouteProgressData] = useState(null);
    const [guideText, setGuideText] = useState("");
    const [distanceToNextTurn, setDistanceToNextTurn] = useState("");
    const [routeData, setRouteData] = useState(null);
    const [isOverview, setIsOverview] = useState(false);
    const [totalDistance, setTotalDistance] = useState("");
    const [estimatedArrivalTime, setEstimatedArrivalTime] = useState("");
    const [timeArriveRemaining, setTimeArriveRemaining] = useState("");
    const [guideKey, setGuideKey] = useState("");
    const [isSimulateRoute, setSimulateRoute] = useState(false);
    const [isNavigationInprogress, setIsNavigationInprogress] = useState(false);
    const [currentLatLng, setCurrentLatLng] = useState({ lat: 0, long: 0 });
    const [rawLatLng, setRawLatLng] = useState({ lat: 0, long: 0 });
    const [isLoading, setIsLoading] = useState(true); // Hiển thị trạng thái tải

    const requestLocationPermission = async () => {
        try {
            if (Platform.OS === "android") {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Quyền truy cập vị trí",
                        message: "Ứng dụng cần quyền để xác định vị trí của bạn.",
                        buttonNeutral: "Hỏi sau",
                        buttonNegative: "Từ chối",
                        buttonPositive: "Đồng ý",
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert("Thông báo", "Quyền truy cập vị trí bị từ chối");
                    return false;
                }
            }
            return true;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };
    useEffect(() => {
        if (currentLocation && destinationLocation) {
            createRoute();
        } else {
            Alert.alert("Thông báo", "Dữ liệu không đầy đủ để tạo tuyến đường.");
            setIsLoading(false);
        }
    }, [currentLocation, destinationLocation]);
    const createRoute = async () => {
        if (!currentLocation || !destinationLocation) {
            Alert.alert("Thông báo", "Thiếu dữ liệu để tạo tuyến đường.");
            setIsLoading(false);
            return;
        }

        try {
            console.log("🚀 ~ createRoute ~ currentLocation:", currentLocation);
            console.log("🚀 ~ createRoute ~ destinationLocation:", destinationLocation);

            await VietMapNavigationController.buildRoute(
                [
                    { lat: currentLocation.latitude, long: currentLocation.longitude },
                    { lat: destinationLocation.latitude, long: destinationLocation.longitude },
                ],
                "driving-traffic"
            );

            console.log("Route data:", route);

            if (!route) {
                throw new Error("Route không hợp lệ hoặc API không phản hồi.", error);
            } else {
                setRouteData(route);
            }
        } catch (error) {
            console.error("Lỗi khi tạo tuyến đường:", error);
            Alert.alert("Lỗi", "Không thể tạo tuyến đường.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const initializeRoute = async () => {
            const permissionGranted = await requestLocationPermission();
            if (permissionGranted) {
                Geolocation.getCurrentPosition(
                    (position) => {
                        setIsLoading(false);
                        createRoute();
                    },
                    (error) => {
                        Alert.alert("Lỗi GPS", "Không thể xác định vị trí của bạn.");
                        console.error(error);
                        setIsLoading(false);
                    },
                    { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
                );
            } else {
                setIsLoading(false);
            }
        };
        initializeRoute();
    }, [currentLocation, destinationLocation, status]);

    const getGuideText = (modifier, type) => {
        if (modifier && type) {
            const data = [type.split(" ").join("_"), modifier.split(" ").join("_")];
            setGuideKey(data.join("_"));
            setGuideText(translationGuide.get(data.join("_"))?.toLowerCase() ?? "");
        }
    };

    const getDistanceToNextTurn = (distance) => {
        const data = distance || 0;
        if (data < 1000) {
            setDistanceToNextTurn(`Còn ${Math.round(data)} mét,`);
        } else {
            setDistanceToNextTurn(`Còn ${(data / 1000).toFixed(2)} Km,`);
        }
    };

    const calculateEstimatedArrivalTime = () => {
        const data = routeProgressData?.nativeEvent?.data?.durationRemaining || 0;
        const dateTime = new Date();
        const estimateArriveTime = new Date(dateTime.getTime() + data * 1000);

        if (estimateArriveTime.getDate() !== dateTime.getDate()) {
            setEstimatedArrivalTime(
                formatDate(estimateArriveTime, "dd/MM - hh:mm a")
            );
        } else {
            setEstimatedArrivalTime(formatTime(estimateArriveTime, "hh mm"));
        }
    };

    const getTimeArriveRemaining = () => {
        const data = routeProgressData?.nativeEvent?.data?.durationRemaining || 0;
        if (data < 60) setTimeArriveRemaining(`${Math.round(data)} giây`);
        else if (data < 3600)
            setTimeArriveRemaining(`${Math.round(data / 60)} phút`);
        else if (data < 86400) {
            const hour = Math.floor(data / 3600);
            const minute = Math.round((data - hour * 3600) / 60);
            setTimeArriveRemaining(
                `${hour < 10 ? "0" + hour : hour} giờ, ${minute < 10 ? "0" + minute : minute
                } phút`
            );
        } else {
            const day = Math.floor(data / 86400);
            const hour = Math.floor((data - day * 86400) / 3600);
            const minute = Math.round((data - hour * 3600 - day * 86400) / 60);
            setTimeArriveRemaining(
                `${day} ngày, ${hour < 10 ? "0" + hour : hour} giờ, ${minute < 10 ? "0" + minute : minute
                } phút`
            );
        }
    };

    const calculateTotalDistance = (distance) => {
        const data = distance || 0;
        if (data < 1000) setTotalDistance(`${Math.round(data)} mét`);
        else setTotalDistance(`${(data / 1000).toFixed(2)} km`);
    };

    const formatDate = (date, format) => {
        const options =
            date.getDate() === 0
                ? { hour: "numeric", minute: "numeric", hour12: true }
                : {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                };
        return new Intl.DateTimeFormat(undefined, options).format(date);
    };

    const formatTime = (time, format) => {
        return new Intl.DateTimeFormat(undefined, {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        }).format(time);
    };

    const handleBackToPickupProgress = () => {
        // Dừng điều hướng
        VietMapNavigationController.finishNavigation();
        // Chuyển về màn hình PickupProgress và truyền rideInfor
        navigation.navigate("PickupProgress", { rideInfor: rideInfor });
    };

    const startNavigation =
        routeData && !isNavigationInprogress ? (
            <View>
                <View style={styles.navigationButtonContainer}>
                    <CheckBox
                        center
                        style={{ borderColor: "transparent", shadowColor: "transparent" }}
                        checkedIcon={
                            <Image
                                source={require("../../../assets/check.png")}
                                style={styles.checkboxIcon}
                            />
                        }
                        uncheckedIcon={
                            <Image
                                source={require("../../../assets/uncheck.png")}
                                style={styles.checkboxIcon}
                            />
                        }
                        title="Simulate route"
                        checked={isSimulateRoute}
                        onPress={() => setSimulateRoute(!isSimulateRoute)}
                    />
                    <TouchableOpacity
                        onPress={() => {
                            setIsNavigationInprogress(true);
                            VietMapNavigationController.startNavigation();
                        }}
                    >
                        <Text style={styles.startNavigationText}>Start navigation</Text>
                    </TouchableOpacity>
                </View>
            </View>
        ) : null;

    const recenterButton =
        isOverview && routeProgressData ? (
            <Pressable
                onPress={() => {
                    VietMapNavigationController.recenter();
                    setIsOverview(false);
                }}
            >
                <View style={styles.recenterButtonContainer}>
                    <Text style={styles.recenterButtonText}>Recenter</Text>
                </View>
            </Pressable>
        ) : null;

    const bottomActionBar = routeProgressData ? (
        <View style={styles.bottomActionBarContainer}>
            <View style={styles.bottomActionBarContent}>
                <Pressable
                    onPress={() => {
                        setRouteProgressData(null);
                        setIsNavigationInprogress(false);
                        VietMapNavigationController.finishNavigation();
                    }}
                >
                    <Image
                        style={styles.actionIcon}
                        source={require("../../../assets/close.png")}
                    />
                </Pressable>
                <View style={styles.bottomActionTextContainer}>
                    <Text style={styles.arrivalTimeText}>
                        {timeArriveRemaining || ""}
                    </Text>
                    <Text style={styles.distanceAndTimeText}>
                        {totalDistance} - {estimatedArrivalTime}
                    </Text>
                </View>
                <Pressable
                    onPress={() => {
                        setIsOverview(true);
                        VietMapNavigationController.overView();
                    }}
                >
                    <Image
                        style={styles.actionIcon}
                        source={require("../../../assets/overview.png")}
                    />
                </Pressable>
            </View>
        </View>
    ) : null;

    const bannerInstruction = routeProgressData ? (
        <View style={styles.bannerInstructionContainer}>
            <View style={styles.bannerBackground}>
                <View style={styles.bannerContent}>
                    <Image style={styles.guideImage} source={Images[guideKey]} />
                    <View style={styles.guideTextContainer}>
                        <Text style={styles.instructionText}>{instructionText || ""}</Text>
                        <Text style={styles.turnDistanceText}>
                            {distanceToNextTurn} {guideText}
                        </Text>
                    </View>
                </View>
            </View>
            {/* <Text style={styles.coordinatesText}>
          {"Raw : " +
            rawLatLng.lat.toFixed(6) +
            " - " +
            rawLatLng.long.toFixed(6)}
        </Text>
        <Text style={styles.coordinatesText}>
          {"Snap: " +
            currentLatLng.lat.toFixed(6) +
            " - " +
            currentLatLng.long.toFixed(6)}
        </Text> */}
        </View>
    ) : null;

    return (
        <View style={styles.container}>
            <Pressable
                style={styles.closeButton}
                onPress={handleBackToPickupProgress}
            >
                <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
            <View style={styles.mapContainer}>
                <VietMapNavigation
                    initialLatLngZoom={{
                        lat: 15.899137913764912,
                        long: 108.33461314832243,
                        zoom: 13,
                    }}
                    navigationPadding={{ left: 50, top: 50, right: 50, bottom: 50 }}
                    navigationZoomLevel={18}
                    shouldSimulateRoute={isSimulateRoute}
                    apiKey={vietmapAPIKey}
                    onRouteProgressChange={(event) => {
                        // console.log("onRouteProgressChange event:", event.nativeEvent);

                        setRawLatLng({
                            lat: event?.nativeEvent?.data?.location?.latitude || 0,
                            long: event?.nativeEvent?.data?.location?.longitude || 0,
                        });
                        setCurrentLatLng({
                            lat: event?.nativeEvent?.data?.snappedLocation?.latitude || 0,
                            long: event?.nativeEvent?.data?.snappedLocation?.longitude || 0,
                        });
                        setRouteProgressData(event);
                        calculateEstimatedArrivalTime();
                        getTimeArriveRemaining();
                        calculateTotalDistance(
                            routeProgressData?.nativeEvent?.data?.distanceRemaining
                        );
                        setInstructionText(
                            event?.nativeEvent?.data?.currentStepInstruction || ""
                        );
                        getGuideText(
                            event?.nativeEvent?.data?.currentModifier,
                            event?.nativeEvent?.data?.currentModifierType
                        );
                        if (event?.nativeEvent?.data?.distanceToNextTurn != null) {
                            getDistanceToNextTurn(
                                event?.nativeEvent?.data?.distanceToNextTurn
                            );
                        }
                    }}
                    onMapMove={() => setIsOverview(true)}
                    onNavigationRunning={() => setIsNavigationInprogress(true)}
                    onArrival={() => {
                        setIsNavigationInprogress(false);
                        setRouteProgressData(null);
                    }}
                    onRouteBuilt={(event) => setRouteData(event)}
                    onCancelNavigation={() => setIsNavigationInprogress(false)}
                    onMapReady={() => { }}
                />
            </View>

            {bannerInstruction}
            {bottomActionBar}
            {recenterButton}
            {startNavigation}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 3,
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
    },
    mapContainer: {
        flex: 3,
    },
    navigationButtonContainer: {
        borderRadius: 50,
        alignItems: "center",
        paddingLeft: 10,
        paddingRight: 10,
        justifyContent: "center",
        flexDirection: "row",
        width: 360,
        height: 60,
        backgroundColor: "white",
        position: "absolute",
        left: Dimensions.get("window").width / 2 - 180,
        bottom: 30,
    },
    startNavigationText: {
        textAlign: "center",
        color: "black",
        fontSize: 16,
        fontWeight: "500",
    },
    checkboxIcon: {
        height: 25,
        width: 25,
    },
    recenterButtonContainer: {
        borderRadius: 50,
        alignItems: "center",
        paddingLeft: 10,
        paddingRight: 10,
        justifyContent: "center",
        width: 120,
        height: 50,
        backgroundColor: "white",
        position: "absolute",
        left: 10,
        bottom: 110,
    },
    recenterButtonText: {
        textAlign: "center",
        color: "black",
        fontSize: 16,
        fontWeight: "500",
    },
    bottomActionBarContainer: {
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        width: Dimensions.get("window").width,
        height: 100,
        backgroundColor: "white",
        position: "absolute",
        left: 0,
        bottom: 0,
        paddingTop: 10,
        paddingBottom: 0,
    },
    bottomActionBarContent: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 20,
    },
    actionIcon: {
        height: 64,
        width: 64,
    },
    bottomActionTextContainer: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
    },
    arrivalTimeText: {
        color: "darkorange",
        fontSize: 22,
        fontWeight: "600",
    },
    distanceAndTimeText: {
        color: "#000000",
        fontSize: 17,
        fontWeight: "400",
        opacity: 0.8,
    },
    bannerInstructionContainer: {
        flexDirection: "column",
        position: "absolute",
        left: 0,
        top: 0,
        paddingLeft: 20,
        width: Dimensions.get("window").width - 20,
        height: 150,
    },
    bannerBackground: {
        borderRadius: 10,
        width: Dimensions.get("window").width - 20,
        height: 75,
        backgroundColor: "#2A5DFF",
        position: "absolute",
        left: 10,
        top: 10,
        opacity: 0.7,
    },
    bannerContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 5,
    },
    guideImage: {
        height: 40,
        width: 40,
    },
    guideTextContainer: {
        flexDirection: "column",
        alignItems: "flex-start",
        paddingLeft: 20,
    },
    instructionText: {
        color: "white",
        fontSize: 20,
        fontWeight: "700",
    },
    turnDistanceText: {
        color: "white",
        fontSize: 13,
        fontWeight: "700",
    },
    coordinatesText: {
        color: "black",
        fontSize: 15,
        fontWeight: "400",
        marginTop: 5,
    },
});

export default CarpoolNavigation;
