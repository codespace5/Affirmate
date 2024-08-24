import React, { useContext } from "react";
import { View, Text, TouchableOpacity  } from "react-native";
import FeaturedCardComponent from "../cards/FeaturedCardComponent";
import { colors } from "../../config/theme";
import { ThemeContext } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../CustomButton";
const images = [
  require("../../images/sample_image_1.jpg"),
  require("../../images/sample_image_2.jpg"),
  require("../../images/sample_image_3.jpg"),
  require("../../images/sample_image_4.jpg"),
];

const FeaturedItemsSection = () => {
  const { theme } = useContext(ThemeContext);
  let activeColors = colors[theme.mode];
  const navigation = useNavigation();
  return (
    <View>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          paddingHorizontal: 30,
          marginTop: 20,
          marginBottom: 15,
          color: activeColors.text,
        }}
      >
        AI Audio
      </Text>
      <View style={{ flexDirection: "column", paddingHorizontal: 50 }}>
        <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
          <CustomButton
                label={"AI Text-to-speech"}
                onPress={() => {
                  navigation.navigate("AITextToSpeech");
                }}
                />
          <CustomButton
                label={"AIMixer"}
                onPress={() => {
                  navigation.navigate("AIMixer");
                }}
                />
        </View>
      </View>
      <View style={{ flexDirection: "column", paddingHorizontal: 50 }}>
        <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
          <CustomButton
                label={"AI Text-to-SFX"}
                onPress={() => {
                  navigation.navigate("AItextSfx");
                }}
                />
        </View>
      </View>
      {/* <CustomButton
            label={"AI Text-to-speech"}
            onPress={() => {
              navigation.navigate("AITextToSpeech");
            }}
            /> */}
      {/* <View style={{ flexDirection: "column", paddingHorizontal: 15 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
              <TouchableOpacity
              onPress={() => navigation.navigate("AITextToSpeech")}
            >
              <FeaturedCardComponent
                imageSource={images[0]}
                title={`AI Audio Generation`}
                description="Text to speech."
              />
               <FeaturedCardComponent
                imageSource={images[0]}
                title={`AI Audio Generation`}
                description="Text to speech."
              />
            </TouchableOpacity>
          </View>
      </View> */}
    </View>
  );
};

export default FeaturedItemsSection;



// import React, { useContext } from "react";
// import { View, Text, TouchableOpacity } from "react-native";
// import FeaturedCardComponent from "../cards/FeaturedCardComponent";
// import { colors } from "../../config/theme";
// import { ThemeContext } from "../../context/ThemeContext";
// import { useNavigation } from "@react-navigation/native";

// const images = [
//   require("../../images/sample_image_1.jpg"),
//   require("../../images/sample_image_2.jpg"),
//   require("../../images/sample_image_3.jpg"),
//   require("../../images/sample_image_4.jpg"),
// ];

// const FeaturedItemsSection = () => {
//   const { theme } = useContext(ThemeContext);
//   const activeColors = colors[theme.mode];
//   const navigation = useNavigation();

//   const handlePress = () => {
//     navigation.navigate("AITextToSpeech");
//   };

//   return (
//     <View>
//       <Text
//         style={{
//           fontSize: 24,
//           fontWeight: "bold",
//           paddingHorizontal: 10,
//           marginTop: 20,
//           marginBottom: 15,
//           color: activeColors.text,
//         }}
//       >
//         AI Audio
//       </Text>
//       <View style={{ flexDirection: "column", paddingHorizontal: 10 }}>
//         {[...Array(2)].map((_, rowIndex) => (
//           <View
//             key={rowIndex}
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-between",
//             }}
//           >
//             <FeaturedCardComponent
//               imageSource={images[0]}
//               title={`AI Audio Generation`}
//               description="Text to speech."
//               onPress={handlePress}
//             />
//           </View>
//         ))}
//       </View>
//     </View>
//   );
// };

// export default FeaturedItemsSection;