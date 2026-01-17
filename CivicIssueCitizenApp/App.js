// /**
//  * Civic Issue Reporting & Management System - Citizen App
//  * React Native Android Application
//  *
//  * Navigation Setup - Placeholder Routes Only
//  */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * App Component
 *
 * This is the root component that:
 * 1. Wraps the app with NavigationContainer
 * 2. Renders AppNavigator
 * 3. Does NOT contain screen logic
 * 4. Does NOT connect to backend
 * 5. Does NOT implement authentication
 */

const App = () => {
    return (

        <NavigationContainer>
            <AppNavigator />
        </NavigationContainer>
    );
};

export default App;
// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { View, Text } from 'react-native';

// const App = () => {
//     return (
//         <NavigationContainer>
//             <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//                 <Text style={{ fontSize: 22 }}>Navigation OK</Text>
//             </View>
//         </NavigationContainer>
//     );
// };

// export default App;
