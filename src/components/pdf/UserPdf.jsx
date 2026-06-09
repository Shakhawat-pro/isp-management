import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    pdf,
    Font
} from '@react-pdf/renderer';
import { formatDisplayDate } from '@/lib/dateUtils';

Font.register({
    family: 'NotoBengali',
    fonts: [
        {
            src: '/fonts/NotoSansBengali-Regular.ttf',
            fontWeight: 'normal',
        },
        {
            src: '/fonts/NotoSansBengali-Bold.ttf',
            fontWeight: 'bold',
        },
    ],
});

// Simple A5-ish styling (you can adjust sizes as needed)
const styles = StyleSheet.create({
    page: {
        padding: 12,
        fontSize: 11,
        fontFamily: 'NotoBengali',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    logo: {
        width: 48,
        height: 48,
        marginRight: 8,
    },
    headerText: {
        flexDirection: 'column',
    },
    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    small: {
        fontSize: 9,
        color: '#333',
    },
    userSection: {
        marginTop: 6,
        marginBottom: 6,
        display: 'flex',
        gap: 4,
    },
    userRow: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    userLabel: {
        width: '25%',
        fontWeight: 'bold',
    },
    userValue: {
        width: '75%',
    },
    userCol: {
        width: '50%',
        flexDirection: 'column',
    },
    tableWrapper: {
        marginTop: 6,
        borderWidth: 1,
        borderColor: '#666',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        minHeight: 20,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#f3f3f3',
    },
    tableCell: {
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: '#ddd',
    },
    colMonth: { width: '40%' },
    colAmount: { width: '20%', textAlign: 'center' },
    colDue: { width: '20%', textAlign: 'center' },
    colSign: { width: '20%', textAlign: 'center', borderRightWidth: 0 },
});

const COMPANY = {
    name: 'Akota Internet',
    logo: '/logo.png',
    phone: '01717367648, 01622983366',
    address: '৫৮৮, পুরাতন দনিয়া, ঢাকা-১২৩৬',
    tagline: 'Reliable internet for everyone',
    email: '',
};

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];

const UserPDFDocument = ({ user }) => (
    <Document>
        <Page size="A5" style={styles.page}>
            {/* Header */}
            <View style={styles.headerRow}>
                <Image src={COMPANY.logo} style={styles.logo} />
                <View style={styles.headerText}>
                    <Text style={styles.companyName}>{COMPANY.name}</Text>
                    <Text style={styles.small}>{COMPANY.tagline}</Text>
                    <Text style={styles.small}>Phone: {COMPANY.phone}</Text>
                    <Text style={styles.small}>{COMPANY.address}</Text>
                </View>
            </View>

            {/* User details */}
            <View style={styles.userSection}>
                <View style={styles.userRow}>
                    <Text style={styles.userLabel}>Name:</Text>
                    <Text style={styles.userValue}>{user?.name || ''}</Text>
                </View>
                <View style={styles.userRow}>
                    <Text style={styles.userLabel}>Client ID:</Text>
                    <Text style={styles.userValue}>{user?.client_id || ''}</Text>
                </View>
                <View style={styles.userRow}>
                    <Text style={styles.userLabel}>Location:</Text>
                    <Text style={styles.userValue}>{user?.address || ''}</Text>
                </View>
                <View style={styles.userRow}>
                    <Text style={styles.userLabel}>Phone:</Text>
                    <Text style={styles.userValue}>{user?.phone || ''}</Text>
                </View>
                <View style={styles.userRow}>
                    <Text style={styles.userLabel}>Package:</Text>
                    <Text style={styles.userValue}>{user?.package_price || ''}</Text>
                </View>
                <View style={styles.userRow}>
                    <Text style={styles.userLabel}>Starting Date:</Text>
                    <Text style={styles.userValue}>{formatDisplayDate(user?.starting_date)}</Text>
                </View>
            </View>

            {/* Payments table */}
            <View style={styles.tableWrapper}>
                <View style={[styles.tableRow, styles.tableHeader]} fixed>
                    <Text style={[styles.tableCell, styles.colMonth]}>Month</Text>
                    <Text style={[styles.tableCell, styles.colAmount]}>Monthly Fee</Text>
                    <Text style={[styles.tableCell, styles.colDue]}>Due</Text>
                    <Text style={[styles.tableCell, styles.colSign]}>Authority Sign</Text>
                </View>
                {MONTHS.map((m) => (
                    <View style={styles.tableRow} key={m}>
                        <Text style={[styles.tableCell, styles.colMonth]}>{m}</Text>
                        <Text style={[styles.tableCell, styles.colAmount]}></Text>
                        <Text style={[styles.tableCell, styles.colDue]}></Text>
                        <Text style={[styles.tableCell, styles.colSign]}></Text>
                    </View>
                ))}
            </View>

            <Text style={[styles.small, { marginTop: 6 }]}>Generated on {new Date().toLocaleString()}</Text>
        </Page>
    </Document>
);

export async function generateUserPDF(user) {
    const doc = <UserPDFDocument user={user} />;
    const asPdf = pdf([]);
    asPdf.updateContainer(doc);
    const blob = await asPdf.toBlob();
    return blob;
}

export default function UserPDF() {
    return null;
}