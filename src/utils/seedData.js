import {
  addCustomer,
  addTailor,
  addRider,
  addOrder
} from '../lib/firebase';

export const seedSampleData = async () => {
  try {
    console.log('Starting to seed sample data...');

    // Add sample customers
    const customer1 = await addCustomer({
      name: 'Ahmed Khan',
      email: 'ahmed@example.com',
      phone: '03001234567',
      address: 'Gulberg, Lahore'
    });

    const customer2 = await addCustomer({
      name: 'Fatima Ali',
      email: 'fatima@example.com',
      phone: '03009876543',
      address: 'DHA, Karachi'
    });

    console.log('Customers added');

    // Add sample tailors
    await addTailor({
      name: 'Usman Tailor',
      email: 'usman@example.com',
      phone: '03011111111',
      address: 'Anarkali, Lahore',
      skills: ['Stitching', 'Embroidery', 'Alterations'],
      specialization: ["Men's Suits", "Women's Dresses"]
    });

    await addTailor({
      name: 'Bilal Stitching',
      email: 'bilal@example.com',
      phone: '03022222222',
      address: 'Saddar, Karachi',
      skills: ['Stitching', 'Designing'],
      specialization: ['Traditional Wear', 'Formal Wear']
    });

    console.log('Tailors added');

    // Add sample riders
    await addRider({
      name: 'Hassan Rider',
      email: 'hassan@example.com',
      phone: '03033333333',
      vehicleType: 'Motorcycle',
      vehicleNumber: 'LES-1234',
      licenseNumber: 'LIC123456'
    });

    await addRider({
      name: 'Ali Delivery',
      email: 'ali@example.com',
      phone: '03044444444',
      vehicleType: 'Car',
      vehicleNumber: 'KHI-5678',
      licenseNumber: 'LIC789012'
    });

    console.log('Riders added');

    // Add sample orders
    await addOrder({
      customerId: customer1,
      customerName: 'Ahmed Khan',
      items: [
        { name: 'Shirt' },
        { name: 'Pants' }
      ],
      totalAmount: 5000
    });

    await addOrder({
      customerId: customer2,
      customerName: 'Fatima Ali',
      items: [
        { name: 'Dress' },
        { name: 'Dupatta' }
      ],
      totalAmount: 8000
    });

    console.log('Orders added');
    console.log('✅ Sample data seeded successfully!');

    return { success: true, message: 'Sample data added successfully!' };
  } catch (error) {
    console.error('Error seeding data:', error);
    return { success: false, error: error.message };
  }
};
