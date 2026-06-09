import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    pdf,
    Font,
} from '@react-pdf/renderer';
import { formatDisplayDate, parseFlexibleDate } from '@/lib/dateUtils';

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


const styles = StyleSheet.create({
    page: {
        size: 'A5',
        padding: 14,
        fontSize: 11,
        fontFamily: 'NotoBengali',
    },

    header: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'center',
    },

    logo: {
        width: 45,
        height: 45,
        marginRight: 8,
    },

    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
    },

    small: {
        fontSize: 9,
        color: '#444',
    },

    title: {
        textAlign: 'center',
        fontSize: 15,
        fontWeight: 'bold',
        marginVertical: 8,
        letterSpacing: 1,
    },

    section: {
        marginBottom: 6,
    },

    row: {
        flexDirection: 'row',
        marginBottom: 3,
    },

    label: {
        width: '40%',
        fontWeight: 'bold',
    },

    value: {
        width: '60%',
    },

    box: {
        borderWidth: 1,
        borderColor: '#333',
        padding: 6,
        marginTop: 6,
    },

    paid: {
        marginTop: 10,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 'bold',
    },

    footer: {
        marginTop: 12,
        textAlign: 'center',
        fontSize: 9,
        color: '#555',
    },

    signRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },

    signBox: {
        width: '45%',
        borderTopWidth: 1,
        borderColor: '#333',
        paddingTop: 4,
        textAlign: 'center',
        fontSize: 9,
    },
});

const COMPANY = {
    name: 'Akota Internet',
    logo: '/logo.png',
    phone: '01717367648, 01622983366',
    address: '৫৮৮, পুরাতন দনিয়া, ঢাকা-১২৩৬',
    tagline: 'Reliable internet for everyone',

};

const ReceiptDocument = ({ user, payment }) => {
    const receiptDate = parseFlexibleDate(payment.payment_date);
    const receiptNo = `RC-${receiptDate ? receiptDate.getTime() : ''}`;

    return (
        <Document>
            <Page style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    <Image src={COMPANY.logo} style={styles.logo} alt="Company Logo" />
                    <View>
                        <Text style={styles.companyName}>{COMPANY.name}</Text>
                        <Text style={styles.small}>{COMPANY.address}</Text>
                        <Text style={styles.small}>Phone: {COMPANY.phone}</Text>
                    </View>
                </View>

                <Text style={styles.title}>PAYMENT RECEIPT</Text>

                {/* Meta */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Receipt No:</Text>
                        <Text style={styles.value}>{receiptNo}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Date:</Text>
                        <Text style={styles.value}>
                            {formatDisplayDate(payment.payment_date)}
                        </Text>
                    </View>
                </View>

                {/* Client Info */}
                <View style={styles.box}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Client Name:</Text>
                        <Text style={styles.value}>{user.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Client ID:</Text>
                        <Text style={styles.value}>{user.client_id}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Phone:</Text>
                        <Text style={styles.value}>{user.phone}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Location:</Text>
                        <Text style={styles.value}>{user.location}</Text>
                    </View>
                </View>

                {/* Payment Info */}
                <View style={styles.box}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Month:</Text>
                        <Text style={styles.value}>{payment.month}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Amount Paid:</Text>
                        <Text style={styles.value}>{payment.amount}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Payment Method:</Text>
                        <Text style={styles.value}>{payment.payment_method}</Text>
                    </View>
                </View>

                <Text style={styles.paid}>✓ PAID</Text>

                {/* Signatures */}
                <View style={styles.signRow}>
                    <Text style={styles.signBox}>Customer Signature</Text>
                    <Text style={styles.signBox}>Authorized Signature</Text>
                </View>

                <Text style={styles.footer}>
                    This is a computer generated receipt. Thank you for your payment.
                </Text>

            </Page>
        </Document>
    );
};

export async function generateReceiptPDF(user, payment) {
    const doc = <ReceiptDocument user={user} payment={payment} />;
    const instance = pdf([]);
    instance.updateContainer(doc);
    return await instance.toBlob();
}
