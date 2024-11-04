import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';
import React, { useState, useRef } from 'react';

import { useCart } from '../context/CartContext';

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

export default function InvoicePDF({
invoiceData = {
  invoiceNumber: 'FF-2024-001',
  date: '20/01/2024',
  customerName: 'Juan Pérez',
  customerEmail: 'juan@example.com',
  customerAddress: 'Calle Principal 123',
  items: [
    { description: 'Ensalada César', quantity: 2, price: 12.99 },
    { description: 'Smoothie Verde', quantity: 3, price: 6.99 },
    { description: 'Bowl de Quinoa', quantity: 1, price: 15.99 },
  ],
  subtotal: 63.94,
  tax: 5.12,
  total: 69.06,
} }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=200&fit=crop"
              style={styles.logo}
            />
            <Text style={styles.title}>Kulo</Text>
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
            Factura #: {invoiceData.invoiceNumber}
          </Text>
          <Text style={[styles.invoiceDetails, { marginBottom: 5 }]}>
            Fecha: {invoiceData.date}
          </Text>
          <Text style={[styles.invoiceDetails, { marginBottom: 5 }]}>
            Cliente: {invoiceData.customerName}
          </Text>
          <Text style={[styles.invoiceDetails, { marginBottom: 5 }]}>
            Email: {invoiceData.customerEmail}
          </Text>
          <Text style={styles.invoiceDetails}>
            Dirección: {invoiceData.customerAddress}
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Descripción</Text>
            <Text style={styles.tableHeaderCell}>Cantidad</Text>
            <Text style={styles.tableHeaderCell}>Precio Unit.</Text>
            <Text style={styles.tableHeaderCell}>Total</Text>
          </View>
          
          {invoiceData.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{item.description}</Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>${item.price.toFixed(2)}</Text>
              <Text style={styles.tableCell}>${(item.quantity * item.price).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalAmount}>${invoiceData.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA (8%)</Text>
            <Text style={styles.totalAmount}>${invoiceData.tax.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${invoiceData.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerContent}>
            ¡Gracias por elegir Fresh Food! Alimentando tu bienestar.
          </Text>
        </View>

        {/* Decorative Image */}
        <Image
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop"
          style={styles.decorativeImage}
        />
      </Page>
    </Document>
  );
}