import React from 'react';
 import {
     View,
     Text,
     StyleSheet,
     ScrollView,
     SafeAreaView,
 } from 'react-native';
 const styles = StyleSheet.create({
     container: {
         flex: 1,
         backgroundColor: '#fff', // Or your desired background color
         padding: 10,
     },
     scrollViewContent: {
         paddingBottom: 20, // Add some padding at the bottom for scroll
     },
     row: {
         flexDirection: 'row',
         justifyContent: 'space-between',
         marginBottom: 10, // Space between rows
     },
     card: {
         backgroundColor: '#f0f0f0', // Or your card background color
         borderRadius: 10,
         padding: 15,
         width: '48%', // Adjust for spacing
         marginBottom: 10, // Space between cards in a column
     },
     cardTitle: {
         fontSize: 16,
         fontWeight: 'bold',
         marginBottom: 5,
     },
     cardValue: {
         fontSize: 24,
     },
     calendarContainer: {
         backgroundColor: '#f0f0f0',
         borderRadius: 10,
         padding: 15,
         width: '100%',
         marginBottom: 10,
     },
     notificationContainer: {
         backgroundColor: '#f0f0f0',
         borderRadius: 10,
         padding: 15,
         width: '100%',
         marginBottom: 10,
     },
     notificationItem: {
         paddingVertical: 8,
         borderBottomWidth: 1,
         borderBottomColor: '#ddd',
     },
     notificationText: {
         fontSize: 14,
     },
 });
 const Dashboard = () => {
     const notifications = [
         'Notification 1',
         'Notification 2',
         'Notification 3',
         'Notification 4',
         'Notification 5',
         'Notification 6',
     ];
     return (
         <SafeAreaView style={styles.container}>
             <ScrollView contentContainerStyle={styles.scrollViewContent}>
                 {/* Row 1 */}
                 <View style={styles.row}>
                     <View style={styles.card}>
                         <Text style={styles.cardTitle}>Risk Level</Text>
                         <Text style={styles.cardValue}>LOW</Text>
                         <Text>No Harm Detected</Text>
                     </View>
                     <View style={styles.card}>
                         <Text style={styles.cardTitle}>My Location</Text>
                         {/* Weather Icon */}
                         <Text>Cloudy Day</Text>
                     </View>
                 </View>
                 {/* Row 2 */}
                 <View style={styles.row}>
                     <View style={styles.card}>
                         <Text style={styles.cardTitle}>Temperature</Text>
                         <Text style={styles.cardValue}>78 °C</Text>
                     </View>
                     <View style={styles.calendarContainer}>
                         <Text style={styles.cardTitle}>September 2025</Text>
                         {/* Calendar Component (Replace with your implementation) */}
                         <Text>Calendar Placeholder</Text>
                     </View>
                 </View>
                 <View style={styles.row}>
                     <View style={styles.card}>
                         <Text style={styles.cardTitle}>Humidity</Text>
                         <Text style={styles.cardValue}>67%</Text>
                     </View>
                     <View style={styles.card}>
                         <Text style={styles.cardTitle}>Soil Moisture</Text>
                         <Text style={styles.cardValue}>60%</Text>
                     </View>
                 </View>
                 {/* Notification Section */}
                 <View style={styles.notificationContainer}>
                     <Text style={styles.cardTitle}>Notification</Text>
                     {notifications.map((notification, index) => (
                         <View style={styles.notificationItem} key={index}>
                             <Text style={styles.notificationText}>{notification}</Text>
                         </View>
                     ))}
                 </View>
             </ScrollView>
         </SafeAreaView>
     );
 };
 export default Dashboard;