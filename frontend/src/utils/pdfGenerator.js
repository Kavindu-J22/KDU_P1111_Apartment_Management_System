import { jsPDF } from 'jspdf';

/**
 * Generates and downloads the Community Events & Registrations PDF Report
 */
export function downloadEventsPDF(events = [], registrations = []) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header Banner
  doc.setFillColor(19, 63, 189); // #133fbd
  doc.rect(0, 0, pageWidth, 28, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('APARTMENT MANAGEMENT SYSTEM', 14, 13);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Community Events & Registration Master Report', 14, 21);
  
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - 14, 21, { align: 'right' });
  
  let y = 38;

  // Section 1: Events Overview
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Scheduled Community Events', 14, y);
  y += 6;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('ID', 16, y + 5.5);
  doc.text('Event Name', 30, y + 5.5);
  doc.text('Type', 80, y + 5.5);
  doc.text('Date', 110, y + 5.5);
  doc.text('Time', 135, y + 5.5);
  doc.text('Location', 155, y + 5.5);
  doc.text('Status', 180, y + 5.5);
  y += 9;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  if (events.length === 0) {
    doc.text('No scheduled events available.', 16, y + 4);
    y += 8;
  } else {
    events.forEach((e) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`#${e.event_id || e.id}`, 16, y + 4);
      doc.text(String(e.name || '').substring(0, 26), 30, y + 4);
      doc.text(String(e.type || 'General'), 80, y + 4);
      doc.text(new Date(e.date).toLocaleDateString(), 110, y + 4);
      doc.text(String(e.time || 'TBD'), 135, y + 4);
      doc.text(String(e.location || 'Clubhouse').substring(0, 14), 155, y + 4);
      doc.text(String(e.status || 'Active'), 180, y + 4);
      
      doc.setDrawColor(226, 232, 240);
      doc.line(14, y + 6.5, pageWidth - 14, y + 6.5);
      y += 8;
    });
  }

  y += 8;
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  // Section 2: Registrations
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Resident Event Registrations', 14, y);
  y += 6;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Reg #', 16, y + 5.5);
  doc.text('Event', 32, y + 5.5);
  doc.text('Resident Name', 85, y + 5.5);
  doc.text('Unit', 135, y + 5.5);
  doc.text('Date', 155, y + 5.5);
  doc.text('Attendance', 178, y + 5.5);
  y += 9;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  if (registrations.length === 0) {
    doc.text('No attendee registrations recorded yet.', 16, y + 4);
    y += 8;
  } else {
    registrations.forEach((r) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`#${r.reg_id || r.id}`, 16, y + 4);
      doc.text(String(r.event_name || '').substring(0, 26), 32, y + 4);
      doc.text(String(r.resident_name || 'Resident'), 85, y + 4);
      doc.text(`${r.resident_building || ''} ${r.resident_unit || ''}`.trim() || '—', 135, y + 4);
      doc.text(new Date(r.event_date || Date.now()).toLocaleDateString(), 155, y + 4);
      doc.text(String(r.attendance || 'registered').toUpperCase(), 178, y + 4);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, y + 6.5, pageWidth - 14, y + 6.5);
      y += 8;
    });
  }

  // Footer on last page
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Official Document — Apartment Management System © 2026', pageWidth / 2, 287, { align: 'center' });

  doc.save('Community_Events_Report.pdf');
}

/**
 * Generates and downloads the Official Facility Guidelines & Community Rules PDF
 */
export function downloadFacilityRulesPDF() {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(19, 63, 189);
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('APARTMENT RESIDENTIAL COMMUNITY', 14, 14);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Facility Guidelines, Amenities & Safety Code of Conduct', 14, 23);

  let y = 44;

  const sections = [
    {
      title: '1. General Facility Access & Operating Hours',
      rules: [
        'Clubhouse, Fitness Center, and Swimming Pool are open daily from 6:00 AM to 10:00 PM.',
        'Access is granted exclusively to approved building residents and registered guests.',
        'All children under the age of 14 must be accompanied by an adult resident at all times.',
        'Electronic access fobs or mobile app verification must be shown upon staff request.'
      ]
    },
    {
      title: '2. Reservation Protocols & Booking Limits',
      rules: [
        'Private bookings (e.g. party hall, tennis court) must be submitted at least 48 hours in advance.',
        'Maximum booking duration per resident is 4 consecutive hours per session.',
        'Reservations are subject to administrative review and availability confirmation.',
        'Cancellations must be filed at least 24 hours prior to the reserved slot.'
      ]
    },
    {
      title: '3. Conduct, Noise & Community Hygiene',
      rules: [
        'Strict quiet hours are in effect from 10:00 PM to 7:00 AM across all common grounds.',
        'Smoking, vaping, glass containers, and open fires are strictly prohibited in all amenity zones.',
        'Users must sanitize gym equipment and leave all shared facilities spotless after use.',
        'Littering or leaving personal belongings in shared spaces will incur immediate penalty fees.'
      ]
    },
    {
      title: '4. Damages, Liability & Enforcement',
      rules: [
        'Residents are directly responsible for any physical damages caused by themselves or their guests.',
        'Any repair or deep cleaning expenses will be billed directly to the resident\'s unit account.',
        'Repeated violations of these community bylaws will result in immediate suspension of facility access.',
        'Management reserves the right to amend these guidelines in consultation with the Homeowners Council.'
      ]
    }
  ];

  sections.forEach((sec) => {
    doc.setTextColor(19, 63, 189);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(sec.title, 14, y);
    y += 6;

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    sec.rules.forEach((rule) => {
      doc.text(`•  ${rule}`, 18, y, { maxWidth: pageWidth - 32 });
      y += 6;
    });
    y += 4;
  });

  // Stamp / Signature Block
  y += 6;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Approved by: Facilities Operations & Board of Directors', 14, y);
  doc.text(`Effective Date: January 1, 2026 — Verified Current`, pageWidth - 14, y, { align: 'right' });

  doc.save('Facility_Rules_Guidelines.pdf');
}

/**
 * Generates and downloads the Official Parking Policy PDF
 */
export function downloadParkingPolicyPDF() {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('APARTMENT RESIDENTIAL COMMUNITY', 14, 14);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Vehicle Parking Regulations & Visitor Parking Enforcement Policy', 14, 23);

  let y = 44;

  const sections = [
    {
      title: '1. Permanent Resident Parking Spaces',
      rules: [
        'Each apartment unit is assigned a designated permanent parking bay based on the title deed.',
        'Residents must only park in their designated unit slot. Parking in another resident\'s bay is strictly forbidden.',
        'All resident vehicles must be registered with management with a valid vehicle license plate number.',
        'Commercial trucks, trailers, and derelict vehicles may not be parked in residential bays.'
      ]
    },
    {
      title: '2. Visitor & Guest Parking Guidelines',
      rules: [
        'Visitor parking is restricted to designated guest bays marked with prefix "V" or guest numbers.',
        'Residents must submit a digital visitor parking request prior to or at the moment of guest arrival.',
        'Visitor parking is limited to a maximum continuous duration of 4 hours unless prior extension is approved.',
        'Overnight visitor parking requires administrative clearance before 8:00 PM.'
      ]
    },
    {
      title: '3. Speed Limits & Safe Driving Regulations',
      rules: [
        'The maximum allowable speed throughout the basement and surface driveway is 10 km/h.',
        'Headlights must be kept on low beam inside basement levels at all times.',
        'Honking is strictly prohibited except in situations of imminent collision hazard.',
        'Pedestrians have absolute right of way at all crossings and entryway ramps.'
      ]
    },
    {
      title: '4. Enforcement, Wheel Clamping & Fines',
      rules: [
        'Unauthorized vehicles parked in resident slots or blocking fire access lanes will be clamped immediately.',
        'A mandatory de-clamping fee of LKR 5,000 applies and must be paid before release.',
        'Vehicles parked in violation for more than 24 hours will be towed away at the vehicle owner\'s expense.',
        'Management accepts no liability for theft or damages sustained during parking on premises.'
      ]
    }
  ];

  sections.forEach((sec) => {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(sec.title, 14, y);
    y += 6;

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    sec.rules.forEach((rule) => {
      doc.text(`•  ${rule}`, 18, y, { maxWidth: pageWidth - 32 });
      y += 6;
    });
    y += 4;
  });

  y += 6;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Enforced by: Security Management & Parking Compliance Authority', 14, y);
  doc.text(`Official Policy Revision: 2026.1`, pageWidth - 14, y, { align: 'right' });

  doc.save('Apartment_Parking_Policy.pdf');
}

/**
 * Generates and downloads the Resident Billing Statement & Financial History Report
 */
export function downloadPaymentReportPDF(resident = {}, bills = [], transactions = [], metrics = {}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(19, 63, 189);
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('APARTMENT MANAGEMENT SYSTEM', 14, 14);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Resident Account Statement & Payment Activity Report', 14, 23);

  doc.setFontSize(8);
  doc.text(`Statement Date: ${new Date().toLocaleDateString()}`, pageWidth - 14, 23, { align: 'right' });

  let y = 42;

  // Resident Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 26, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Resident: ${resident.full_name || resident.email || 'Resident Account'}`, 18, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Email: ${resident.email || 'N/A'}`, 18, y + 13);
  doc.text(`Assigned Unit: ${resident.building_name || 'Block A'} - ${resident.unit_number || 'Unit'}`, 18, y + 19);

  doc.setFont('helvetica', 'bold');
  doc.text(`Total Outstanding: LKR ${Number(metrics.outstandingAmount || metrics.pendingPayments || 0).toLocaleString()}`, pageWidth - 20, y + 7, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Lifetime Paid: LKR ${Number(metrics.totalPaid || 0).toLocaleString()}`, pageWidth - 20, y + 13, { align: 'right' });
  doc.text(`Account Status: Active Resident`, pageWidth - 20, y + 19, { align: 'right' });

  y += 34;

  // Invoices Table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Invoice Breakdown', 14, y);
  y += 5;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Invoice #', 16, y + 5);
  doc.text('Description', 45, y + 5);
  doc.text('Due Date', 110, y + 5);
  doc.text('Amount (LKR)', 145, y + 5);
  doc.text('Status', 180, y + 5);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  if (bills.length === 0) {
    doc.text('No invoice records found for this account.', 16, y + 4);
    y += 8;
  } else {
    bills.forEach((b) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(String(b.invoice_id || `#INV-${b.id}`), 16, y + 4);
      doc.text(String(b.description || 'Maintenance Bill').substring(0, 32), 45, y + 4);
      doc.text(new Date(b.due_date).toLocaleDateString(), 110, y + 4);
      doc.text(Number(b.amount || 0).toLocaleString(), 145, y + 4);
      doc.text(String(b.status || 'unpaid').toUpperCase(), 180, y + 4);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, y + 6, pageWidth - 14, y + 6);
      y += 7.5;
    });
  }

  y += 6;
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  // Transactions Table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Recent Payment Transactions', 14, y);
  y += 5;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Transaction ID', 16, y + 5);
  doc.text('Invoice Ref', 60, y + 5);
  doc.text('Payment Date', 105, y + 5);
  doc.text('Method', 145, y + 5);
  doc.text('Amount (LKR)', 175, y + 5);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  if (transactions.length === 0) {
    doc.text('No payment transactions recorded yet.', 16, y + 4);
    y += 8;
  } else {
    transactions.forEach((tx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(String(tx.transaction_id || `#TX-${tx.id}`), 16, y + 4);
      doc.text(String(tx.invoice_id || '—'), 60, y + 4);
      doc.text(new Date(tx.created_at || Date.now()).toLocaleDateString(), 105, y + 4);
      doc.text(String(tx.method || 'Online Payment'), 145, y + 4);
      doc.text(Number(tx.amount || 0).toLocaleString(), 175, y + 4);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, y + 6, pageWidth - 14, y + 6);
      y += 7.5;
    });
  }

  // Footer note
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated billing statement and requires no physical signature.', pageWidth / 2, 287, { align: 'center' });

  doc.save(`Billing_Statement_${resident.unit_number || 'Unit'}.pdf`);
}
