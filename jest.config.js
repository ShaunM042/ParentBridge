<<<<<<< HEAD
// filepath: /Users/shaunmathew/Downloads/ParentBridge-main/jest/setup.js
jest.mock('react-native-gesture-handler', () => {
  return {
    GestureHandlerRootView: ({ children }) => children,
    Swipeable: jest.fn(),
    DrawerLayout: jest.fn(),
    State: {},
    PanGestureHandler: jest.fn(),
    BaseButton: jest.fn(),
    RectButton: jest.fn(),
    TapGestureHandler: jest.fn(),
    FlingGestureHandler: jest.fn(),
    LongPressGestureHandler: jest.fn(),
    NativeViewGestureHandler: jest.fn(),
    PinchGestureHandler: jest.fn(),
    RotationGestureHandler: jest.fn(),
    ScrollView: jest.requireActual('react-native').ScrollView,
    Slider: jest.requireActual('react-native').Slider,
    Switch: jest.requireActual('react-native').Switch,
    TextInput: jest.requireActual('react-native').TextInput,
    ToolbarAndroid: jest.requireActual('react-native').ToolbarAndroid,
    ViewPagerAndroid: jest.requireActual('react-native').ViewPagerAndroid,
    DrawerLayoutAndroid: jest.requireActual('react-native').DrawerLayoutAndroid,
    WebView: jest.requireActual('react-native-webview'),
    FlatList: jest.requireActual('react-native').FlatList,
    SectionList: jest.requireActual('react-native').SectionList,
  };
});

module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)/)',
  ],
  setupFiles: ['./jest/setup.js'], // Add the setup file here
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};
=======
module.exports = {
  preset: 'react-native',
};
>>>>>>> 4afa2d97e8bf9adac2d6892e72b9d774a47647c5
