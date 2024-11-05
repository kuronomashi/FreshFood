import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';
import { Pedidos } from '../Interfaces/InterfacesDeProfuctos';

// Registrar fuentes personalizadas
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Roboto',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  logo: {
    width: 150,
    height: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: '#2E7D32',
    marginBottom: 20,
  },
  invoiceDetails: {
    fontSize: 10,
    color: '#4CAF50',
  },
  table: {
    flexDirection: 'column',
    marginTop: 30,
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#4CAF50',
    paddingBottom: 5,
    marginBottom: 10,
  },
  tableHeaderCell: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: 700,
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  tableCell: {
    fontSize: 10,
    flex: 1,
    color: '#333333',
  },
  totalSection: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#4CAF50',
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#2E7D32',
    marginRight: 50,
  },
  totalAmount: {
    fontSize: 12,
    fontWeight: 700,
    color: '#2E7D32',
    width: 100,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
  },
  footerContent: {
    borderTopWidth: 1,
    borderTopColor: '#4CAF50',
    paddingTop: 10,
    fontSize: 10,
    color: '#4CAF50',
  },
  decorativeImage: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 100,
    height: 100,
    opacity: 0.1,
  },
});

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ModelOrder {
  Order: Pedidos;
  CarInfo: CartItem[];
}

export default function InvoicePDF({ Order,CarInfo }: ModelOrder) {

  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const formattedTime = today.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const total = CarInfo.reduce((acc, item) => acc + item.quantity * item.price, 0);


  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Resumen de compra  </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceDetails}>Fresh Food, Inc.</Text>
            <Text style={styles.invoiceDetails}>Av. Saludable 456</Text>
            <Text style={styles.invoiceDetails}>Tel: (123) 456-7890</Text>
            <Text style={styles.invoiceDetails}>info@freshfood.com</Text>
          </View>
        </View>

        {/* Invoice Details */}
        <View>
          <Text style={[styles.invoiceDetails, { marginBottom: 5 }]}>
            Factura #: {"2"}
          </Text>
          <Text style={[styles.invoiceDetails, { marginBottom: 5 }]}>
            Fecha: {formattedDate}
          </Text>
          <Text style={[styles.invoiceDetails, { marginBottom: 5 }]}>
            Hora: {formattedTime}
          </Text>
          <Text style={[styles.invoiceDetails, { marginBottom: 5 }]}>
            Cliente: {Order.name}
          </Text>
          <Text style={[styles.invoiceDetails, { marginBottom: 5 }]}>
            Email: {Order.email}
          </Text>
          <Text style={[styles.invoiceDetails, { marginBottom: 5 }]}>
            Telefono: {Order.phone}
          </Text>
          <Text style={styles.invoiceDetails}>
            Dirección: {Order.address}
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Nombre</Text>
            <Text style={styles.tableHeaderCell}>Cantidad</Text>
            <Text style={styles.tableHeaderCell}>Precio Unit.</Text>
            <Text style={styles.tableHeaderCell}>Total</Text>
          </View>
          
          {CarInfo.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{item.name}</Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>${item.price.toFixed(2)}</Text>
              <Text style={styles.tableCell}>${(item.quantity * item.price).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerContent}>
            ¡Gracias por elegir Fresh Food! Alimentando tu bienestar.
          </Text>
        </View>
      </Page>
    </Document>
  );
}